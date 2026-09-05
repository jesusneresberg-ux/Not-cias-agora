# Notícias Agora — versão profissional com RSS

## Rodar o servidor
1. Instale Node.js 18+.
2. Na pasta do projeto: `npm install`
3. Execute: `npm start`
4. Abra `http://localhost:3000`

O backend agrega feeds RSS, faz cache por 10 minutos e expõe `/api/news`.
O app atualiza a cada 15 minutos.

### Fontes configuradas
- Agência Brasil
- CNN Brasil
- InfoMoney
- Olhar Digital

Observação: feeds podem mudar ou ficar temporariamente indisponíveis. Para produção, recomenda-se adicionar um proxy/servidor próprio e revisar os termos de uso de cada fonte.
