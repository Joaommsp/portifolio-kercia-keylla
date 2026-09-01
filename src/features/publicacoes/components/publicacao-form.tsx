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
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Campo } from "@/components/form/campo";
import { SectionMessage } from "@/components/layout/section-message";
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
import { slugify } from "@/lib/format";
import type { Resultado } from "@/lib/resultado";

const { publicacao: textos } = painel;

export function PublicacaoForm({
  valoresIniciais = PUBLICACAO_EM_BRANCO,
  aoSalvar,
}: {
  valoresIniciais?: PublicacaoFormulario;
  aoSalvar: (formulario: PublicacaoFormulario) => Promise<Resultado<string>>;
}) {
  const [erro, setErro] = useState<string | null>(null);
  // Slug já preenchido é escolha de alguém: o título não passa por cima dele.
  const [slugManual, setSlugManual] = useState(valoresIniciais.slug !== "");

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
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

  const salvarComo = (publicado: boolean) =>
    handleSubmit(async (valores) => {
      setErro(null);

      const resultado = await aoSalvar({ ...valores, publicado });

      if ("erro" in resultado) {
        // Nada é limpo nem resetado: a autora corrige e tenta de novo.
        setErro(resultado.erro);
      }
    });

  return (
    <form
      noValidate
      onSubmit={salvarComo(valoresIniciais.publicado)}
      className="flex flex-col gap-6"
    >
      <fieldset disabled={isSubmitting} className="flex flex-col gap-6">
        <Campo
          id="titulo"
          rotulo={textos.campos.titulo}
          erro={errors.titulo?.message}
          limite={LIMITES_PUBLICACAO.titulo}
          valor={titulo}
        >
          <Input
            id="titulo"
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
          id="slug"
          rotulo={textos.campos.slug}
          ajuda={textos.ajuda.slug}
          erro={errors.slug?.message}
          limite={LIMITES_PUBLICACAO.slug}
          valor={slug}
        >
          <Input
            id="slug"
            aria-invalid={errors.slug !== undefined}
            {...registroSlug}
            onChange={(evento) => {
              registroSlug.onChange(evento);
              setSlugManual(true);
            }}
          />
        </Campo>

        <Campo
          id="resumo"
          rotulo={textos.campos.resumo}
          erro={errors.resumo?.message}
          limite={LIMITES_PUBLICACAO.resumo}
          valor={resumo}
        >
          <Textarea
            id="resumo"
            rows={3}
            aria-invalid={errors.resumo !== undefined}
            {...register("resumo")}
          />
        </Campo>

        <Campo
          id="corpo"
          rotulo={textos.campos.corpo}
          erro={errors.corpo?.message}
          limite={LIMITES_PUBLICACAO.corpo}
          valor={corpo}
        >
          <Textarea
            id="corpo"
            rows={14}
            aria-invalid={errors.corpo !== undefined}
            {...register("corpo")}
          />
        </Campo>

        <Campo
          id="imagemUrl"
          rotulo={textos.campos.imagemUrl}
          ajuda={textos.ajuda.imagemUrl}
          erro={errors.imagemUrl?.message}
        >
          <Input
            id="imagemUrl"
            inputMode="url"
            aria-invalid={errors.imagemUrl !== undefined}
            {...register("imagemUrl")}
          />
        </Campo>

        <Campo
          id="tag"
          rotulo={textos.campos.tag}
          erro={errors.tag?.message}
          limite={LIMITES_PUBLICACAO.tag}
          valor={tag}
        >
          <Input
            id="tag"
            aria-invalid={errors.tag !== undefined}
            {...register("tag")}
          />
        </Campo>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="lg"
            onClick={salvarComo(true)}
          >
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

      {erro === null ? null : (
        <SectionMessage tom="erro">{erro}</SectionMessage>
      )}
    </form>
  );
}
