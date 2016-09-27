// JavaScript smart contract interface
var contractAbi =
[ { "constant": true, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "getProof", "outputs": [ { "name": "publisher", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "timestamp", "type": "uint256", "value": "0" }, { "name": "ipfsHash", "type": "string", "value": "" } ], "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "type": "function" }, { "constant": false, "inputs": [ { "name": "hash", "type": "bytes32" }, { "name": "ipfsHash", "type": "string" } ], "name": "publishProof", "outputs": [ { "name": "success", "type": "bool" } ], "type": "function" }, { "constant": true, "inputs": [ { "name": "hash", "type": "bytes32" } ], "name": "proofExists", "outputs": [ { "name": "exists", "type": "bool", "value": false } ], "type": "function" }, { "inputs": [], "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "_from", "type": "address" }, { "indexed": true, "name": "_hash", "type": "bytes32" } ], "name": "ProofEvent", "type": "event" } ];

var contractAddress = '0xa0A13284A15DC36f23d4A8589d28f39EA8A6afF6'

