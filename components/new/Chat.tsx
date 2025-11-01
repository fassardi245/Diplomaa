"use client";

import { useEffect, useState } from "react";

interface FacebookMessengerProps {
  pageId: string;
  appId: string;
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        xfbml: boolean;
        version: string;
      }) => void;
      CustomerChat: {
        show: () => void;
        hide: () => void;
      };
    };
  }
}

export default function Chat({ pageId, appId }: FacebookMessengerProps) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        xfbml: true,
        version: "v17.0",
      });
      console.log("SDK de Facebook inicializado correctamente");
      setIsSDKLoaded(true);
    };

    const loadSDK = () => {
      if (document.getElementById("facebook-jssdk")) return;
      const js = document.createElement("script");
      js.id = "facebook-jssdk";
      js.src = `https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v17.0&appId=${appId}`;
      js.async = true;
      js.onload = () => console.log("SDK de Facebook cargado correctamente");
      js.onerror = (error) => {
        console.error("Error al cargar el SDK de Facebook:", error);
        setError(
          "No se pudo cargar el chat de Facebook Messenger. Intenta actualizar la página."
        );
      };
      document.body.appendChild(js);
    };

    loadSDK();
  }, [appId]);

  useEffect(() => {
    if (isSDKLoaded && window.FB && window.FB.CustomerChat) {
      window.FB.CustomerChat.show();
    }
  }, [isSDKLoaded]);

  return (
    <>
      <div id="fb-root"></div>
      <div
        className="fb-customerchat"
        data-attribution="biz_inbox"
        data-page_id={pageId}
      ></div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-md shadow-lg z-50">
          {error}
        </div>
      )}
    </>
  );
}
