# mechanicAI

Aplicativo web mobile-first para quem tem carro e ainda não tem vocabulário de oficina. A pessoa registra o que sabe, separa pergunta de fato e chega na oficina com perguntas prontas. Sem data e km informados, o app não inventa atraso.

- Público: dono de carro leigo, no celular, antes e depois da visita.
- Problema: a oficina fala em peça e intervalo; a pessoa não sabe o que perguntar nem o que já foi feito.
- Mudança: uma folha de visita em linguagem simples e um lembrete que só existe depois do registro da volta.
- Demo: https://luizwardo.github.io/mechanicAI/
- Repositório: https://github.com/luizwardo/mechanicAI
- QR Code e texto curto: https://luizwardo.github.io/mechanicAI/portfolio.html

A publicação usa GitHub Actions. Na primeira vez, em Settings → Pages, a fonte precisa ser GitHub Actions.

## Equipe e tecnologias

Repositório `luizwardo/mechanicAI`. Interface em React 18 e TypeScript, empacotada com Vite. Estado no aparelho (`localStorage` e rascunho em `sessionStorage`). Sem API e sem senha em texto puro: a senha vira um hash SHA-256 antes de ser gravada. A fonte é a do sistema, para a tela abrir sem baixar arquivo externo.

## Rodar

```bash
cd mechanicAI
npm install
npm test
npm run dev
```

O Vite escuta na rede. No computador, abra http://localhost:5173. No celular, use o endereço de Network que o terminal mostrar.

`npm run build` gera a pasta `dist` com caminhos relativos. `npm test` cobre status, formulário, senha, missão e leitura dos dados. `npm run lint` confere os tipos com o TypeScript. O estilo do código está no `.prettierrc.json` (sem ponto e vírgula, aspas simples) e as regras do oxlint no `.oxlintrc.json`.

## Demo rápida

1. Toque em **Abrir demo (Gol 1.0 · 87 mil km)**.
2. Veja itens **Sem registro**. Não existe “atrasado” inventado.
3. As missões são opcionais. Dá para pausar em Início ou em Ajuda, sem ranking e sem perder o progresso.
4. Abra **Óleo e filtro do motor**, leia a frase e volte ou siga para o agendamento.
5. Escolha a oficina, o dia e **Confirmar agendamento**.
6. Abra de novo o óleo, **Já fiz — registrar volta**, salve data e km.
7. O item passa a ter status pelo intervalo de referência.
8. Atualize a página: a sessão, o carro e o rascunho do formulário continuam.
9. Em Ajuda, os indicadores deste aparelho mostram conclusões, erros de preenchimento e tempo. Não guardam nome nem e-mail.

## O que o guia pede e onde está

| Critério | No produto |
|---|---|
| Valor humano | Público, dor e mudança acima. O app mede conclusão, erro e tempo neste aparelho. |
| Mobile e acesso | Coluna única, alvo de 48 px, foco visível, rótulos, contraste do texto, teclado nos formulários. |
| Dados e falha | Validação, estado vazio, erro com alerta, carregamento ao abrir, leitura inválida sem apagar por cima, aviso sem rede. |
| Gamificação | Três missões ligadas à visita, barra pessoal, medalha só para a pessoa, pausa e retomada. |
| Qualidade | README, testes em `scripts/rules.test.mjs`, checagem de tipos, oxlint configurado. |
| Publicação | Actions em `.github/workflows/pages.yml`, `404.html`, QR em `public/qr.svg`. |

## Evidências com pessoas

O repositório não inventa entrevista. A medição automática está em Ajuda e não substitui 3 a 5 testes com gente real. Para cada pessoa, anote tempo, erros, se concluiu o agendamento e um comentário. Não registre nome, e-mail nem senha nesse relato.

## Heurísticas visíveis

| Heurística | No produto |
|---|---|
| Visibilidade do status | Pills Sem registro / Em dia / Em breve / Na hora de cuidar |
| Mundo real | Frases leigas |
| Controle | Voltar guarda o rascunho; “Não sei”; pausar missões; sair |
| Consistência | Mesmos botões, barra inferior, linguagem |
| Prevenção | Sem data/km não há atraso |
| Reconhecimento | Lista pronta de cuidados |
| Recuperação | Erro no formulário e nova tentativa se o dado salvo não abrir |
| Ajuda | Texto sob o campo e regra da missão |
