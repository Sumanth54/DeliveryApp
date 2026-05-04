import { useEffect, useState } from "react";

const SCRIPT_ID = "razorpay-checkout-script";

export function useRazorpayScript(enabled = true) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLoaded(false);
      return;
    }

    if ((window as Window & { Razorpay?: unknown }).Razorpay) {
      setLoaded(true);
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [enabled]);

  return loaded;
}

function handleLoad() {
  return undefined;
}

function handleError() {
  return undefined;
}
