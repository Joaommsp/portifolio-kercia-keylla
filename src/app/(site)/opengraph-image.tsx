import { ImageResponse } from "next/og";

import {
  contato,
  metadadosDoSite,
  perfil,
  secaoAtendimento,
} from "@/content/site";
import { CORES_EM_HEX as CORES } from "@/lib/tema";

/**
 * Imagem que aparece quando o link é colado no WhatsApp, no Instagram ou no
 * LinkedIn. Gerada aqui em vez de virar arquivo: o texto sai do mesmo conteúdo
 * da página, então trocar o papel ou a região não deixa a prévia desatualizada.
 *
 * Sem a foto da Keylla de propósito — o retrato é 4:5 e ficaria cortado no
 * formato 1200×630 de todas as redes.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${perfil.nome} — ${perfil.papel}`;

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: CORES.ground,
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: CORES.brass,
          }}
        >
          {perfil.papel}
        </div>
        <div
          style={{
            fontSize: 104,
            color: CORES.olive,
            marginTop: 18,
            lineHeight: 1.05,
          }}
        >
          {perfil.nome}
        </div>
        <div
          style={{
            fontSize: 30,
            color: CORES["ink-soft"],
            marginTop: 28,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {metadadosDoSite.descricao}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          borderTop: `2px solid ${CORES.line}`,
          paddingTop: 28,
          fontSize: 26,
          color: CORES.ink,
        }}
      >
        <span>{contato.regiao}</span>
        <span style={{ color: CORES.line }}>·</span>
        <span>{secaoAtendimento.contextos[0]}</span>
      </div>
    </div>,
    size,
  );
}
