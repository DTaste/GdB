// Config
var ipfsHost = 'ipfs.infura.io';
var ipfsWebPort = '8080';


if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://morden.infura.io/yrWceYoyF37gvs5bwHzE"));
}

var gdbContract = web3.eth.contract(contractAbi).at(contractAddress);

// Globals... who cares...      
window.web3 = web3;
window.ipfsDataHost = "https://" + ipfsHost + "/ipfs";
window.txFound = false;


function getProofCallback(info, resultWatch) {


    gdbContract.getProof.call(resultWatch.args._hash, function (err, result) {
        record = "";
        record += "<p> <a href=\"http://testnet.etherscan.io/tx/" + resultWatch.transactionHash + "\"  target=\"_blank\"> Voir la preuve blockchain </a></p>"
        record += "<p> Enregistré le " + new Date(result[1] * 1000).toLocaleString() + "</p>";
        ipfsHash = result[2];


        document.getElementById("proofImg").src = window.ipfsDataHost + "/" + window.ipfsHash;
        document.getElementById("ipfsDiv").style.display = 'block';

        info.innerHTML = record;
    });
}

function getURLArg(param) {
    var vars = {};
    window.location.href.replace(location.hash, '').replace(
            /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
            function (m, key, value) { // callback
                vars[key] = value !== undefined ? value : '';
            }
    );

    if (param) {
        return vars[param] ? vars[param] : null;
    }
    return vars;
}

function getProof() {

    //https://ipfs.infura.io/ipfs/QmSWxHpPQ8Wn34p2ctxZzXdHNVTyQHJECiYgSrYeQJdsnW

    givenhash = "0x" + getURLArg("h");
    // hash = "0x32f08ea1e8859632b6097686b93f287e8e6e56838de0af841263f3fd33421716"
    //hash = web3.toAscii(hash);
    info = document.getElementById("blockchainData");
    
    //window.ipfsHash = "QmSWxHpPQ8Wn34p2ctxZzXdHNVTyQHJECiYgSrYeQJdsnW";
    //console.log(hash);



    gdbContract.getProof.call(givenhash, function (err, result) {
        record = "";
        //record += "<p> <a href=\"http://testnet.etherscan.io/tx/" + resultWatch.transactionHash + "\"  target=\"_blank\"> Voir la preuve blockchain </a></p>"
        record += "<p> Enregistré le " + new Date(result[1] * 1000).toLocaleString() + "</p>";
        ipfsHash = result[2];


        document.getElementById("proofImg").src = window.ipfsDataHost + "/" + window.ipfsHash;
        document.getElementById("ipfsDiv").style.display = 'block';

        info.innerHTML = record;
    });
    
    var proofEvents = gdbContract.ProofEvent({_hash: givenhash}, {fromBlock: 0, toBlock: 'latest'});
  
    var i = setInterval(function () {          
          if(window.txFound)
              clearInterval(i);
          else          
            watchTx(proofEvents, info);
    }, 1000);
    
}

function watchTx (proofEvents, info) {
    
    proofEvents.get(function (err, resultWatch) {
        if(window.txFound) return;
        if (err) {
            console.log("Error = " + err);
            return;
        }  
        if(resultWatch.length == 1) {
            window.txFound = true;
            info.innerHTML += "<p> <a href=\"http://testnet.etherscan.io/tx/" + resultWatch[0].transactionHash + "\"  target=\"_blank\"> Voir la preuve blockchain </a></p>"
        }
    });
    
//    proofEvents.watch(function (err, resultWatch) {
//        if (err) {
//            console.log("Error = " + err);
//            return;
//        }  
//        window.txFound = true;
//        info.innerHTML += "<p> <a href=\"http://testnet.etherscan.io/tx/" + resultWatch.transactionHash + "\"  target=\"_blank\"> Voir la preuve blockchain </a></p>"
//    });
}

window.onload = getProof();