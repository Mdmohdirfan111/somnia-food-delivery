const contractAddress = "0x975844def26d0E972b7c1769db4FBE992c333D43"; // Your contract address
const abi = [ /* Paste ABI from Remix here */ ];

let provider, signer, contract;

document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('placeOrder').addEventListener('click', placeOrder);

async function connectWallet() {
    if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        
        const network = await provider.getNetwork();
        if (network.chainId !== 50312) {
            alert("Please switch to Somnia Testnet!");
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xC488' }], // Somnia Testnet
            });
        }
        
        document.getElementById('walletStatus').textContent = "Connected!";
        loadOrders();
    } else {
        alert("Install MetaMask!");
    }
}

async function placeOrder() {
    const restaurant = document.getElementById('restaurant').value;
    const item = document.getElementById('item').value;
    const amount = ethers.utils.parseEther(document.getElementById('amount').value);
    
    const tx = await contract.placeOrder(restaurant, item, { value: amount });
    await tx.wait();
    alert("Order placed!");
    loadOrders();
}

async function loadOrders() {
    const orders = await contract.getOrders();
    let ordersHTML = "";
    orders.forEach((order, index) => {
        ordersHTML += `
            <div>
                <p><strong>Order #${index}</strong></p>
                <p>Restaurant: ${order.restaurant}</p>
                <p>Item: ${order.item}</p>
                <p>Amount: ${ethers.utils.formatEther(order.amount)} STT</p>
                <p>Status: ${order.delivered ? "Delivered" : "Pending"}</p>
            </div>
        `;
    });
    document.getElementById('orders').innerHTML = ordersHTML;
}
