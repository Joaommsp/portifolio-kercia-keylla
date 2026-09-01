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

import { Campo } from "@/components/form/campo";
import { SectionMessage } from "@/components/layout/section-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <Campo
          id="login-email"
          rotulo={login.email.rotulo}
          erro={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email !== undefined}
            {...register("email", { required: login.email.obrigatorio })}
          />
        </Campo>

        <Campo
          id="login-senha"
          rotulo={login.senha.rotulo}
          erro={errors.senha?.message}
        >
          <Input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.senha !== undefined}
            {...register("senha", { required: login.senha.obrigatorio })}
          />
        </Campo>

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
