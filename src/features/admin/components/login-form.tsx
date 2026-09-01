"use client";

/**
 * Formulário de entrada no painel.
 *
 * Nem o e-mail nem a senha têm teto de caracteres: um `maxLength` aqui cortaria
 * silenciosamente um e-mail longo ou uma senha colada do gerenciador, e
 * trancaria a autora fora do próprio site. O erro exibido é o traduzido pelo
 * `entrar`, que não revela se o e-mail existe (ADM-02, ADM-03).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { SectionMessage } from "@/components/layout/section-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { painel } from "@/content/site";
import { entrar } from "@/features/admin/auth";
import { CAMINHO_PAINEL } from "@/lib/rotas";

type CamposDeLogin = {
  email: string;
  senha: string;
};

const { login } = painel;

export function LoginForm() {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CamposDeLogin>({ defaultValues: { email: "", senha: "" } });

  const enviar = handleSubmit(async ({ email, senha }) => {
    setErro(null);

    const resultado = await entrar(email.trim(), senha);

    if ("erro" in resultado) {
      // Nada é limpo: a autora corrige o que errou sem redigitar o resto.
      setErro(resultado.erro);
      return;
    }

    router.replace(CAMINHO_PAINEL);
  });

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{login.email.rotulo}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email !== undefined}
            {...register("email", { required: login.email.obrigatorio })}
          />
          {errors.email === undefined ? null : (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="senha">{login.senha.rotulo}</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.senha !== undefined}
            {...register("senha", { required: login.senha.obrigatorio })}
          />
          {errors.senha === undefined ? null : (
            <p className="text-sm text-destructive">{errors.senha.message}</p>
          )}
        </div>

        <Button type="submit" size="lg">
          {isSubmitting ? login.acao.emAndamento : login.acao.rotulo}
        </Button>
      </fieldset>

      {erro === null ? null : (
        <SectionMessage tom="erro">{erro}</SectionMessage>
      )}
    </form>
  );
}
