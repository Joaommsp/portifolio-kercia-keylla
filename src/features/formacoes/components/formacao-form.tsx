"use client";

/**
 * Formulário de uma formação — o mesmo para criar e para editar.
 *
 * A validação é a do `formacaoSchema`: os limites não são reescritos aqui, e o
 * número que o contador mostra é o mesmo que o schema recusa (FOR-05).
 *
 * Os valores iniciais são lidos uma vez, na montagem. Quem troca a formação em
 * edição remonta o formulário pela `key` — assim não há efeito sincronizando
 * estado de formulário com prop.
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
import {
  formacaoSchema,
  LIMITES_FORMACAO,
  ORDEM_MAXIMA_FORMACAO,
  ORDEM_MINIMA_FORMACAO,
  STATUS_FORMACAO,
  type FormacaoFormulario,
} from "@/features/formacoes/schemas";
import type { Resultado } from "@/lib/resultado";

const { formacoes: textos } = painel;

export function FormacaoForm({
  valoresIniciais,
  emEdicao,
  aoSalvar,
  aoCancelar,
}: {
  valoresIniciais: FormacaoFormulario;
  /** `true` quando o formulário edita uma formação já cadastrada. */
  emEdicao: boolean;
  aoSalvar: (formulario: FormacaoFormulario) => Promise<Resultado<string>>;
  aoCancelar: () => void;
}) {
  const [erro, setErro] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormacaoFormulario>({
    resolver: zodResolver(formacaoSchema),
    defaultValues: valoresIniciais,
  });

  const titulo = useWatch({ control, name: "titulo" });
  const instituicao = useWatch({ control, name: "instituicao" });
  const descricao = useWatch({ control, name: "descricao" });

  const salvar = handleSubmit(async (valores) => {
    setErro(null);

    const resultado = await aoSalvar(valores);

    if ("erro" in resultado) {
      // Nada é limpo nem resetado: a autora corrige e tenta de novo.
      setErro(resultado.erro);
    }
  });

  return (
    <form
      noValidate
      onSubmit={salvar}
      className="flex flex-col gap-5 rounded-xs border border-line bg-surface p-6"
    >
      <h2 className="font-display text-xl text-olive">
        {emEdicao ? textos.edicao : textos.novo}
      </h2>

      <fieldset disabled={isSubmitting} className="flex flex-col gap-5">
        <Campo
          id="formacao-titulo"
          rotulo={textos.campos.titulo}
          erro={errors.titulo?.message}
          limite={LIMITES_FORMACAO.titulo}
          valor={titulo}
        >
          <Input
            id="formacao-titulo"
            aria-invalid={errors.titulo !== undefined}
            {...register("titulo")}
          />
        </Campo>

        <Campo
          id="formacao-instituicao"
          rotulo={textos.campos.instituicao}
          erro={errors.instituicao?.message}
          limite={LIMITES_FORMACAO.instituicao}
          valor={instituicao}
        >
          <Input
            id="formacao-instituicao"
            aria-invalid={errors.instituicao !== undefined}
            {...register("instituicao")}
          />
        </Campo>

        <Campo
          id="formacao-descricao"
          rotulo={textos.campos.descricao}
          erro={errors.descricao?.message}
          limite={LIMITES_FORMACAO.descricao}
          valor={descricao}
        >
          <Textarea
            id="formacao-descricao"
            rows={3}
            aria-invalid={errors.descricao !== undefined}
            {...register("descricao")}
          />
        </Campo>

        <div className="grid gap-5 cartao:grid-cols-2">
          <Campo
            id="formacao-ano"
            rotulo={textos.campos.ano}
            erro={errors.ano?.message}
          >
            <Input
              id="formacao-ano"
              type="number"
              inputMode="numeric"
              aria-invalid={errors.ano !== undefined}
              {...register("ano", { valueAsNumber: true })}
            />
          </Campo>

          <Campo
            id="formacao-ordem"
            rotulo={textos.campos.ordem}
            ajuda={textos.ajuda.ordem}
            erro={errors.ordem?.message}
          >
            <Input
              id="formacao-ordem"
              type="number"
              inputMode="numeric"
              min={ORDEM_MINIMA_FORMACAO}
              max={ORDEM_MAXIMA_FORMACAO}
              aria-invalid={errors.ordem !== undefined}
              {...register("ordem", { valueAsNumber: true })}
            />
          </Campo>
        </div>

        <div
          role="radiogroup"
          aria-label={textos.campos.status}
          className="flex flex-col gap-2"
        >
          <span className="text-sm font-medium">{textos.campos.status}</span>

          <div className="flex flex-wrap gap-5">
            {STATUS_FORMACAO.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 text-sm text-ink"
              >
                <input
                  type="radio"
                  value={status}
                  className="accent-olive"
                  {...register("status")}
                />
                {textos.situacoes[status]}
              </label>
            ))}
          </div>

          {errors.status === undefined ? null : (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            {isSubmitting ? textos.acoes.emAndamento : textos.acoes.salvar}
          </Button>

          {emEdicao ? (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={aoCancelar}
            >
              {textos.acoes.cancelar}
            </Button>
          ) : null}
        </div>
      </fieldset>

      {erro === null ? null : (
        <SectionMessage tom="erro">{erro}</SectionMessage>
      )}
    </form>
  );
}
