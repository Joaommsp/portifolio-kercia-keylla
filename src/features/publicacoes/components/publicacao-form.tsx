"use client";

/**
 * Formulário de uma publicação.
 *
 * A validação é a do `publicacaoSchema` — os limites não são reescritos aqui,
 * e o mesmo número que o schema recusa é o que o contador mostra (ADM-04).
 *
 * Quem grava é a rota, pelo `aoSalvar`: o formulário cuida de validar, do
 * estado de salvamento e de mostrar a falha sem limpar nada do que foi
 * digitado (ADM-05, ADM-07).
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Campo } from "@/components/form/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { painel } from "@/content/site";
import { PUBLICACAO_EM_BRANCO } from "@/features/publicacoes/converter";
import {
  LIMITES_PUBLICACAO,
  publicacaoSchema,
  type PublicacaoFormulario,
} from "@/features/publicacoes/schemas";
import { PublicacaoPrevia } from "@/features/publicacoes/components/publicacao-previa";
import { slugify } from "@/lib/format";
import type { Resultado } from "@/lib/resultado";
import { cn } from "@/lib/utils";

const { publicacao: textos } = painel;

export function PublicacaoForm({
  valoresIniciais = PUBLICACAO_EM_BRANCO,
  publicadoEm = null,
  aoSalvar,
  aoMudarPendencia,
}: {
  valoresIniciais?: PublicacaoFormulario;
  /** Data já gravada, para a prévia não inventar a data de publicação. */
  publicadoEm?: Date | null;
  aoSalvar: (formulario: PublicacaoFormulario) => Promise<Resultado<string>>;
  /** Avisa quem envolve o formulário que há alteração não salva. */
  aoMudarPendencia?: (pendente: boolean) => void;
}) {
  const [previa, setPrevia] = useState(false);
  const idDasAbas = useId();
  // Slug já preenchido é escolha de alguém: o título não passa por cima dele.
  const [slugManual, setSlugManual] = useState(valoresIniciais.slug !== "");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PublicacaoFormulario>({
    resolver: zodResolver(publicacaoSchema),
    defaultValues: valoresIniciais,
  });

  // `useWatch` no lugar de `watch()`: o React Compiler não consegue memoizar a
  // função devolvida por `watch` e desiste de compilar o componente inteiro.
  const titulo = useWatch({ control, name: "titulo" });
  const slug = useWatch({ control, name: "slug" });
  const resumo = useWatch({ control, name: "resumo" });
  const corpo = useWatch({ control, name: "corpo" });
  const tag = useWatch({ control, name: "tag" });

  const registroTitulo = register("titulo");
  const registroSlug = register("slug");

  useEffect(() => {
    aoMudarPendencia?.(isDirty);
  }, [isDirty, aoMudarPendencia]);

  const salvarComo = (publicado: boolean) =>
    handleSubmit(async (valores) => {
      const resultado = await aoSalvar({ ...valores, publicado });

      if ("erro" in resultado) {
        // Nada é limpo nem resetado: a autora corrige e tenta de novo. A
        // mensagem do Firebase segue fiel, agora em toast.
        toast.error(painel.avisos.naoSalvou, { description: resultado.erro });
      }
    });

  return (
    <form
      noValidate
      onSubmit={salvarComo(valoresIniciais.publicado)}
      className="flex flex-col gap-6"
    >
      {/*
        A prévia é uma aba, não uma segunda tela: a autora alterna sem perder o
        que já digitou, porque o formulário continua montado embaixo.
      */}
      <div
        role="tablist"
        aria-label={textos.abas.rotulo}
        className="flex gap-1 border-b border-line"
      >
        {[
          { chave: "escrever", rotulo: textos.abas.escrever, ativa: !previa },
          { chave: "previa", rotulo: textos.abas.previa, ativa: previa },
        ].map((aba) => (
          <button
            key={aba.chave}
            type="button"
            role="tab"
            id={`${idDasAbas}-${aba.chave}`}
            aria-selected={aba.ativa}
            onClick={() => setPrevia(aba.chave === "previa")}
            className={cn(
              "min-h-11 border-b-2 px-4 text-xs font-semibold uppercase tracking-rotulo transition-colors",
              aba.ativa
                ? "border-olive text-olive"
                : "border-transparent text-ink-soft pointer-fino:hover:text-olive",
            )}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      {previa ? (
        <div role="tabpanel" aria-labelledby={`${idDasAbas}-previa`}>
          <PublicacaoPrevia
            formulario={{
              titulo,
              slug,
              resumo,
              corpo,
              tag,
              imagemUrl: "",
              publicado: valoresIniciais.publicado,
            }}
            publicadoEm={publicadoEm}
          />
        </div>
      ) : null}

      <fieldset
        disabled={isSubmitting}
        role="tabpanel"
        aria-labelledby={`${idDasAbas}-escrever`}
        className={cn("flex flex-col gap-6", previa && "hidden")}
      >
        <Campo
          id="publicacao-titulo"
          rotulo={textos.campos.titulo}
          erro={errors.titulo?.message}
          limite={LIMITES_PUBLICACAO.titulo}
          valor={titulo}
        >
          <Input
            id="publicacao-titulo"
            aria-invalid={errors.titulo !== undefined}
            {...registroTitulo}
            onChange={(evento) => {
              registroTitulo.onChange(evento);

              if (!slugManual) {
                setValue("slug", slugify(evento.target.value));
              }
            }}
          />
        </Campo>

        <Campo
          id="publicacao-slug"
          rotulo={textos.campos.slug}
          ajuda={textos.ajuda.slug}
          erro={errors.slug?.message}
          limite={LIMITES_PUBLICACAO.slug}
          valor={slug}
        >
          <Input
            id="publicacao-slug"
            aria-invalid={errors.slug !== undefined}
            {...registroSlug}
            onChange={(evento) => {
              registroSlug.onChange(evento);
              setSlugManual(true);
            }}
          />
        </Campo>

        <Campo
          id="publicacao-resumo"
          rotulo={textos.campos.resumo}
          erro={errors.resumo?.message}
          limite={LIMITES_PUBLICACAO.resumo}
          valor={resumo}
        >
          <Textarea
            id="publicacao-resumo"
            rows={3}
            aria-invalid={errors.resumo !== undefined}
            {...register("resumo")}
          />
        </Campo>

        <Campo
          id="publicacao-corpo"
          rotulo={textos.campos.corpo}
          erro={errors.corpo?.message}
          limite={LIMITES_PUBLICACAO.corpo}
          valor={corpo}
        >
          <Textarea
            id="publicacao-corpo"
            rows={14}
            aria-invalid={errors.corpo !== undefined}
            {...register("corpo")}
          />
        </Campo>

        {/* Sem contador: o teto de 2048 do endereço é técnico, não editorial —
            contá-lo só encheria a tela de número sem uso. */}
        <Campo
          id="publicacao-imagemUrl"
          rotulo={textos.campos.imagemUrl}
          ajuda={textos.ajuda.imagemUrl}
          erro={errors.imagemUrl?.message}
        >
          <Input
            id="publicacao-imagemUrl"
            inputMode="url"
            aria-invalid={errors.imagemUrl !== undefined}
            {...register("imagemUrl")}
          />
        </Campo>

        <Campo
          id="publicacao-tag"
          rotulo={textos.campos.tag}
          erro={errors.tag?.message}
          limite={LIMITES_PUBLICACAO.tag}
          valor={tag}
        >
          <Input
            id="publicacao-tag"
            aria-invalid={errors.tag !== undefined}
            {...register("tag")}
          />
        </Campo>

        <div className="flex flex-wrap gap-3">
          <Button type="button" size="lg" onClick={salvarComo(true)}>
            {isSubmitting ? textos.acoes.emAndamento : textos.acoes.publicar}
          </Button>

          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={salvarComo(false)}
          >
            {textos.acoes.rascunho}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
