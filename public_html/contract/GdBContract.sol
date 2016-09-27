contract GdBContract {
	
    	    
    struct Proof {
        address owner;
        // Keeps the time when this record was created.
        uint time;
        string ipfsHash;
    }
    
    event ProofEvent (address indexed _from, bytes32 indexed _hash);
        
    mapping(bytes32 => Proof) proofs;
		
    address pio_owner;
    
    
    function GdBContract(){
            pio_owner = msg.sender; 
    }

    function publishProof(bytes32 hash, string ipfsHash) returns (bool success) {

        if (proofExists(hash)) {
                    return false;
        }else{

                    proofs[hash].owner = msg.sender;
                    proofs[hash].time = now;
                    proofs[hash].ipfsHash = ipfsHash;                    
                    ProofEvent(msg.sender, hash);
                    return true;
        }


    }

		

    function getProof(bytes32 hash) constant returns (address publisher, uint timestamp, string ipfsHash) {
            Proof p = proofs[hash];        
            publisher = p.owner;
            timestamp = p.time;
            ipfsHash = p.ipfsHash;
    }

    

    function proofExists(bytes32 hash) constant returns (bool exists){
            if (proofs[hash].time != 0) {
                    return true;
            }
            return false;
    }
	
    function kill() {
        if (msg.sender != pio_owner) return;
        selfdestruct(pio_owner);   
    }

}

