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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
