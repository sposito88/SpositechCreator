# Spositech Content Creator

Um gerador de conteúdo moderno e responsivo que permite aos usuários criar conteúdo personalizado com base em um tom de voz, tipo de conteúdo e assunto.

## Características

- Interface moderna e minimalista com Bootstrap 5
- Suporte para tema claro e escuro
- Internacionalização (Português do Brasil e Inglês)
- Design totalmente responsivo
- Animação de carregamento durante a geração de conteúdo
- Integração com webhook para geração de conteúdo

## Tecnologias Utilizadas

- HTML5 / CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Variáveis CSS para temas

## Estrutura do Projeto

```
.
├── index.html           # Arquivo HTML principal
├── css/
│   └── styles.css       # Estilos CSS
├── js/
│   ├── app.js           # Lógica principal da aplicação
│   └── translations.js  # Traduções
└── README.md            # Este arquivo
```

## Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. Selecione o idioma de sua preferência
3. Escolha entre modo claro ou escuro
4. Preencha o formulário com:
   - Tom de voz
   - Tipo de conteúdo
   - Assunto
5. Clique em "Gerar Conteúdo"
6. Espere o processamento e veja o resultado gerado

## Integração com API

### Requisição

```javascript
fetch('https://n8n.spositech.com.br/webhook/createspositech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tone: "profissional",
    contentType: "productDescription",
    subject: "Venda de uma camera Canon t3",
    language: "pt-BR"
  })
})
```

### Resposta esperada

```json
{
  "result": "Texto gerado como resposta aqui..."
}
```

## Configuração do n8n

Para que o webhook funcione corretamente no n8n, siga estes passos:

1. No nó de webhook, certifique-se de configurar corretamente:
   - Na seção de "HTTP Method", escolha "POST"
   - No campo "Path", use exatamente "createspositech" (sem barras no início)
   - Use "Authentication" como "None"
   - Escolha uma das opções:
     - **Se estiver usando "Respond to Webhook"**: Configure "Respond" como "Using Respond to Webhook Node"
     - **Caso contrário**: Configure "Respond" como "Immediately"

2. Se tiver o erro "404 Not Found":
   - Verifique se a URL na aplicação (`js/app.js`) corresponde exatamente à URL do seu servidor n8n
   - Verifique na interface do n8n qual é o caminho completo do webhook (normalmente mostrado na parte superior do nó)
   - Certifique-se de que o caminho na aplicação seja igual ao do n8n
   - A URL completa deve ser algo como: `https://n8n.spositech.com.br/webhook/createspositech`

3. Para configurar a resposta correta:
   - Adicione um nó de "Respond to Webhook" ao fluxo
   - Configure o nó para retornar um objeto JSON no formato:
   ```json
   {
     "result": "Texto de resposta gerado pelo n8n"
   }
   ```

4. Não esqueça de testar o webhook direto do n8n clicando em "Listen for test event" para verificar se está funcionando antes de integrar com a aplicação.

## Personalização

Para personalizar o webhook:

1. Abra o arquivo `js/app.js`
2. Altere a URL do webhook na função `handleFormSubmit` 