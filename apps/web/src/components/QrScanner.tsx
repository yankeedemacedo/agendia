import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface Props {
  onScan: (texto: string) => void;
  onClose: () => void;
}

// Escaneamento contínuo: emite a cada QR novo e segue lendo (modo porteiro)
export function QrScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  const lastRef = useRef("");

  useEffect(() => {
    if (!window.isSecureContext) {
      setError("A câmera exige HTTPS ou localhost.");
      return;
    }
    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    reader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        (result, err) => {
          if (stopped) return;
          if (result) {
            const texto = result.getText();
            // Evita bip duplo do mesmo QR parado na frente da câmera
            if (texto !== lastRef.current) {
              lastRef.current = texto;
              onScan(texto);
              setTimeout(() => (lastRef.current = ""), 3000);
            }
          }
          if (err && err.name !== "NotFoundException") {
            console.warn(err);
          }
        },
      )
      .catch((e: Error) => {
        if (e.name === "NotAllowedError") {
          setError("Permissão de câmera negada. Libere nas configurações do navegador.");
        } else if (e.name === "NotFoundError") {
          setError("Nenhuma câmera encontrada neste dispositivo.");
        } else {
          setError(`Não foi possível abrir a câmera: ${e.message}`);
        }
      });

    return () => {
      stopped = true;
      // Libera a câmera ao sair
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan]);

  return (
    <div className="scanner">
      {error ? (
        <p className="alert-error">{error}</p>
      ) : (
        <video ref={videoRef} className="scanner-video" muted playsInline />
      )}
      <button className="btn-ghost" onClick={onClose}>
        Fechar câmera
      </button>
    </div>
  );
}
