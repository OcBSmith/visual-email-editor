console.log("Popup JS loaded");

document.addEventListener("DOMContentLoaded", function () {
    console.log("Popup DOM ready");

    document.getElementById("btn").addEventListener("click", async function () {
        console.log("Button clicked");
        try {
            await browser.runtime.sendMessage({ action: "openEditor" });
            window.close();
        } catch (e) {
            console.error("Error:", e);
        }
    });
});
