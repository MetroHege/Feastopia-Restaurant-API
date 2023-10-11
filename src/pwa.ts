(async () => {
        if ("serviceWorker" in navigator) {
            try {
                const worker = await navigator.serviceWorker.register("./sw.js");
                console.log("Service Worker Registered");
            } catch (e) {
                if (e instanceof DOMException) {
                    console.log("SW registration failed");
                } else if (e instanceof Error) {
                console.log(e.message);
            }
        }
    }
})();
