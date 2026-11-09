# mechanicAI — MVP (sala de aula)

Aplicativo web mobile-first para quem tem carro e ainda não tem vocabulário de oficina.

## O que este MVP demonstra

1. **Cadastro do carro** (marca/modelo/ano/km) com opção **“Não sei”** na última revisão  
2. **Início** separando o que tem registro do que ainda é pergunta — **sem inventar atraso**  
3. **Cuidado em linguagem leiga** + “comigo ou com a oficina?”  
4. **Folha da visita** com perguntas para mostrar ao mecânico  
5. **Registro na volta** (data + km) — só então o lembrete pode existir  
6. **Histórico** local (sem banco de dados; `localStorage` no aparelho)

## Rodar

```bash
cd mechanicAI
npm install
npm run dev
```

Abra o endereço do Vite (geralmente `http://localhost:5173`). No desktop, a UI aparece em moldura de celular para projetar em sala.

## Demo rápida (1–2 min)

1. Toque em **Abrir demo (Gol 1.0 · 87 mil km)**  
2. Veja itens como **Sem registro** (não há “atrasado”)  
3. Abra **Óleo e filtro** → leia a frase → **Incluir na folha**  
4. **Copiar folha / concluir**  
5. Volte ao óleo → **Já fiz — registrar volta** → salve  
6. O item passa a ter status com base no intervalo de referência

## Heurísticas (Nielsen) aplicadas de forma visível

| Heurística | No produto |
|---|---|
| Visibilidade do status | Pills Sem registro / Em dia / Em breve / Na hora |
| Mundo real | Frases leigas, não jargão de oficina |
| Controle do usuário | Voltar, “Não sei”, recomeçar, atualizar km |
| Consistência | Mesmos botões, dock inferior, linguagem |
| Prevenção de erro | Sem data/km → nunca marca atraso |
| Reconhecimento | Lista de cuidados pronta, não digitar o nome do serviço |
| Minimalismo | Uma ação principal por tela (CTA no polegar) |
| Recuperação | Mensagens de erro claras nos formulários |
| Ajuda | Textos de ajuda sob os campos e notas de regra |

## Mobile-first

- Alvos de toque ≥ 48px  
- CTA fixo na base (zona do polegar)  
- Coluna única, tipografia ≥ 16px efetiva  
- `viewport-fit=cover` + safe area  
- Sem dependência de hover

## Sem banco

Estado em memória + `localStorage` (`mechanicai-mvp-v1`). Sem API e sem servidor.
# mechanicAI
