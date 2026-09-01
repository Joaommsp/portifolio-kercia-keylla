# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Teste de limite deve asserir o valor literal do limite, nunca a constante que ele valida.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `schemas` · harmful: 0
- features: site-portfolio
- evidence: M11 src/features/publicacoes/schemas.ts:38 (schemas)
- last seen: 2026-09-01T20:15:50Z

### L-002 - Teste de valor derivado deve usar entrada em que as partes diferem, para o denominador nao poder ser confundido com o numerador.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `componentes` · harmful: 0
- features: site-portfolio
- evidence: M30 src/components/form/campo.tsx:38 (componentes)
- last seen: 2026-09-01T20:15:50Z

### L-003 - Requisito com duas clausulas ligadas por 'e' precisa de uma task e de uma evidencia por clausula.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `rastreabilidade` · harmful: 0
- features: site-portfolio
- evidence: SEO-02 src/app/layout.tsx:26-36 (rastreabilidade)
- last seen: 2026-09-01T20:15:50Z

### L-004 - Rota que decide metadados ou 404 precisa de teste proprio: o gate de build so prova compilacao, nao comportamento.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `rotas` · harmful: 0
- features: site-portfolio
- evidence: PUB-07 src/app/(site)/publicacoes/[slug]/page.tsx:34 (rotas)
- last seen: 2026-09-01T20:15:50Z

### L-005 - Regra de autorizacao fora do codigo da aplicacao precisa de verificacao executavel ou de decisao registrada assumindo revisao manual.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `seguranca` · harmful: 0
- features: site-portfolio
- evidence: SEC-01 firestore.rules:32-34 (seguranca)
- last seen: 2026-09-01T20:15:50Z

### L-006 - Cada ID de requisito deve ter um unico sentido em toda a spec e nos comentarios do codigo.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `spec` · harmful: 0
- features: site-portfolio
- evidence: SIT-06 .specs/features/site-portfolio/spec.md:59 (spec)
- last seen: 2026-09-01T20:15:50Z

### L-007 - Requisito que fixa uma quantidade de itens exibidos precisa de teste que conte os itens renderizados.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `secoes` · harmful: 0
- features: site-portfolio
- evidence: M53 src/features/site/sections/o-que-faz-uma-at.tsx:34 (secoes)
- last seen: 2026-09-01T21:04:24Z

### L-008 - Texto definido por extenso na spec deve ser asserido como literal no teste, nunca pela constante de conteudo que o renderiza.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `conteudo` · harmful: 0
- features: site-portfolio
- evidence: M54 src/content/site.ts:166 (conteudo)
- last seen: 2026-09-01T21:04:24Z

### L-009 - Requisito de ordem deve asserir todos os elementos que a spec lista, inclusive os que moram no layout e nao na pagina.
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `layout` · harmful: 0
- features: site-portfolio
- evidence: M55 src/app/(site)/layout.tsx:10 (layout)
- last seen: 2026-09-01T21:04:24Z

### L-010 - Requisito de ausencia (nenhuma cor literal, nenhuma chamada nativa) fecha por check automatizado de varredura, nao por inspecao.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `estilo` · harmful: 0
- features: site-portfolio
- evidence: SIT-05 src/app/globals.css:91-98 (estilo)
- last seen: 2026-09-01T21:04:24Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
