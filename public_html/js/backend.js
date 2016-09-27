// Config
var ipfsHost = 'ipfs.infura.io';
var ipfsAPIPort = '5001';
var ipfsWebPort = '8080';


// IPFS
var ipfs = window.IpfsApi(ipfsHost, ipfsAPIPort, {protocol: 'https'});
ipfs.swarm.peers(function (err, response) {
    if (err) {
        console.error(err);
    } else {
        console.log("IPFS - connected to " + response.length + " peers");
        console.log(response);
    }
});




if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    document.getElementById("noMetamask").style.display = 'block';
    //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var gdbContract = web3.eth.contract(contractAbi).at(contractAddress);

var account = web3.eth.accounts[0];

var sendDataObject = {
    from: account,
    gas: 200000,
};






// Globals... who cares...      
window.web3 = web3;
window.account = account;
window.hash = "";
window.ipfsDataHost = "https://" + ipfsHost + "/ipfs";
window.shortUrl = "";

var proofEvents = gdbContract.ProofEvent({_from: window.account}, {fromBlock: 0, toBlock: 'latest'});


function onFileSelected() {
    reset ();
    document.getElementById("qrCodeButton").disabled = false;
    

    file = document.getElementById("fileInput").files[0];
    var reader = new FileReader(); // File API object
    reader.onload = function (event) {
        document.getElementById("loadedImg").style.display = 'block';
        document.getElementById('proofImg').src = event.target.result;
    }
    reader.readAsDataURL(file);
}


function uploadFile() {

    setStatus("Veuillez patienter pendant l'enregistrement ...");
    gdbContract.proofExists.call(web3.toAscii(window.hash), function (err, res) {
        
        if (res == true) {
            clearStatus();
            setStatus("Cette preuve a déjà été enregistrée.");
        } else {
            file = document.getElementById("fileInput").files[0];
            reader = new FileReader()
            reader.onload = function () {
                var toStore = ipfs.Buffer(reader.result);
                ipfs.add(toStore, function (err, res) {
                    if (err || !res) {
                        return console.error('ipfs add error', err, res)
                    }

                    var ipfsHash = res[0].hash;
                    sendTransaction(ipfsHash);


                })
            }
            reader.readAsArrayBuffer(file);
        }
    });
}

function sendTransaction(ipfsHash) {
    var hashEth = web3.toAscii(window.hash)
    gdbContract.publishProof.sendTransaction(hashEth, ipfsHash, function (err, result) {
        clearStatus();
        if (err) {
            setStatus("Erreur pendant l'envoie des données : " + err.message);
        } else {
            setStatus("Transaction en cours de validation ...");
            transactionStatus(result);

        }
    });
}

function transactionStatus(txid) {

    var startTime = Date.now();
    var counter = 0;
    var i = setInterval(function () {
        web3.eth.getTransactionReceipt(txid, function (error, result) {

            if (result != null) {
                clearInterval(i);
                clearStatus();
                setStatus("Transaction <a href=\"http://testnet.etherscan.io/tx/" + txid + "\"  target=\"_blank\">" + txid + "</a> validée");

                watchHistoric();

            } else {
                elapsedTime = Date.now() - startTime;
                clearStatus();
                setStatus("Transaction en cours de validation depuis " + Math.trunc(elapsedTime / 1000) + " secondes");
            }
        });


        counter++;

    }, 1000);

}

String.prototype.trunc =
        function (n) {
            return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
        };

function clearStatus() {
    var status = document.getElementById("status");
    status.innerHTML = "";
}
;

function setStatus(message) {
    var status = document.getElementById("status");
    status.innerHTML += "<p>" + message + "</p>";
}
;



function addHistoryLine(spanHistory, resultWatch) {


    gdbContract.getProof.call(resultWatch.args._hash, function (err, result) {
        record = "";
        record += "<p>Preuve du " + new Date(result[1] * 1000).toLocaleString() + "</p>";
        record += "<p> <a href=\"http://testnet.etherscan.io/tx/" + resultWatch.transactionHash + "\"  target=\"_blank\"> Voir la transaction </a></p>";
        flink = window.ipfsDataHost + "/" + result[2];
        record += "<p>Image : " + "<a href=\"" + flink + "\">" + result[2] + "</a></p>";
        record += "<br>";

        spanHistory.innerHTML = record + spanHistory.innerHTML;
    });



}

function watchHistoric() {

    histDiv = document.getElementById("history");
    histDiv.innerHTML = "";

    var line = document.createElement("h4");
    line.innerHTML = "Vos dernières transactions : " + window.account;
    histDiv.appendChild(line);

    var spanHistory = document.createElement("span");
    histDiv.appendChild(spanHistory);

    proofEvents.watch(function (err, result) {
        if (err) {
            console.log(err)
            return;
        }
        addHistoryLine(spanHistory, result);
    });
}

function arrayBufferToWordArray(ab) {
    var i8a = new Uint8Array(ab);
    var a = [];
    for (var i = 0; i < i8a.length; i += 4) {
        a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }
    return CryptoJS.lib.WordArray.create(a, i8a.length);
}

function computeHashFromFile() {
    var f = document.getElementById("fileInput").files[0];
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onloadend = (function (theFile) {
        return function (e) {
            var arrayBuffer = e.target.result;

            var hash = CryptoJS.SHA256(arrayBufferToWordArray(arrayBuffer));
            window.hash = CryptoJS.enc.Hex.stringify(hash);
            // uploadFile();
            // createQRCode();

        };

    })(f);
    reader.onerror = function (e) {
        console.error(e);
    };



    // Read in the image file as a data URL.
    reader.readAsArrayBuffer(f);
    window.currentFile = f;

}

function createQRCode() {




    gapi.client.setApiKey('AIzaSyC8JOvDiXIFIxe0gI73cX0WOG8SRC9e-7U'); //get your ownn Browser API KEY
    gapi.client.load('urlshortener', 'v1').then(function () {
        var request = gapi.client.urlshortener.url.insert({
            'resource': {
                'longUrl': "http://www.playitopen.org/gdb/index.html?h=" + window.hash
            }
        });
        request.execute(function (response)
        {

            if (response.id != null)
            {

                window.shortUrl = response.id;
                
                
                
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    text: response.id,
                    width: 128,
                    height: 128,
                    colorDark: "#bd000e",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
                document.getElementById("printSticker").style.display = 'block';
                document.getElementById("printButton").style.display = 'block';

            } else
            {
                alert("error: creating short url");
            }

        });
    });


}





function onClickQrCode() {
    window.open(window.shortUrl, '_blank');
}

function printQRCode()
{
    data = document.getElementById("printSticker").innerHTML;


    var mywindow = window.open('', 'Stickers', 'height=400,width=600');
    mywindow.document.write('<html><head><title>Print</title>');
    //mywindow.document.write("<link rel=\"stylesheet\" type=\"text/css\" href=\"./css/print.css\" />");                             
    // mywindow.document.write('<style type="text/css" media="screen"> p {color: #bd000e;} </style>');                             
    mywindow.document.write('</head><body >');
    mywindow.document.write('<table style="border-spacing: 40px;">');

    for (i = 0; i < 6; i++) {
        mywindow.document.write("<tr>")
        mywindow.document.write("<td>" + data + "</td>");
        mywindow.document.write("<td>" + data + "</td>");
        mywindow.document.write("<td>" + data + "</td>");
        mywindow.document.write("<td>" + data + "</td>");
        mywindow.document.write("<td>" + data + "</td>");
        mywindow.document.write("</tr>");
    }

    mywindow.document.write('</table></body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10
    console.log(mywindow.document);
    mywindow.print();
    mywindow.close();

    return true;
}

function computeQRCode() {
    computeHashFromFile();
    createQRCode();
    document.getElementById("sendButton").disabled = false;
}

function reset () {
    clearStatus();
    document.getElementById("qrCodeButton").disabled = true;
    document.getElementById("sendButton").disabled = true;    
    document.getElementById("printButton").style.display = 'none';
    document.getElementById("loadedImg").style.display = 'none';
    document.getElementById("printSticker").style.display = 'none';
    qrcode = document.getElementById("qrcode");
    while (qrcode.firstChild) {
        qrcode.removeChild(qrcode.firstChild);        
    }
    
}

watchHistoric();