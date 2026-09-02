import { ActionLink } from "@/components/layout/action-link";
import { Container } from "@/components/layout/container";
import { PhotoFrame } from "@/components/layout/photo-frame";
import { ancoras, perfil, secaoHero } from "@/content/site";

/** Abertura da página: saudação, nome, papel, apresentação e os dois CTAs. */
export function Hero() {
  return (
    <section id={ancoras.topo} className="scroll-mt-cabecalho pt-10 duo:pt-20">
      <Container>
        <div className="grid items-center gap-8 duo:grid-cols-2 duo:gap-16">
          <div>
            <p className="font-script text-3xl leading-none text-brass md:text-4xl">
              {perfil.saudacao}
            </p>

            <h1 className="mt-1.5 font-display text-6xl font-light leading-none tracking-titulo text-olive sm:text-7xl lg:text-8xl">
              {perfil.nomeEmLinhas.map((linha) => (
                <span key={linha} className="block">
                  {linha}
                </span>
              ))}
            </h1>

            <p className="mt-4.5 text-xs uppercase tracking-papel text-brass md:text-sm">
              {perfil.papel}
            </p>

            <p className="mt-5 max-w-leitura text-ink-soft">
              {perfil.apresentacao}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <ActionLink href={secaoHero.acoes.primaria.href} withArrow>
                {secaoHero.acoes.primaria.rotulo}
              </ActionLink>
              <ActionLink
                href={secaoHero.acoes.secundaria.href}
                variant="ghost"
              >
                {secaoHero.acoes.secundaria.rotulo}
              </ActionLink>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm duo:max-w-none">
            <PhotoFrame
              comAnel
              prioridade
              foto={secaoHero.foto}
              className="bg-linear-to-b from-olive/20 to-surface-2"
            />

            <p className="absolute bottom-16 left-0 max-w-nota border border-line border-l-3 border-l-brass bg-surface px-4 py-3 font-display text-base leading-snug text-olive shadow-cartao duo:-left-14">
              {perfil.selo}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
