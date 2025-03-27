#!/bin/bash

# Script de implantação do Spositech Creator
# Este script deve ser executado como root ou com sudo

# Cores para melhor legibilidade
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando implantação do Spositech Creator...${NC}"

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Nginx não está instalado. Instalando...${NC}"
    apt-get update
    apt-get install -y nginx
    if [ $? -ne 0 ]; then
        echo -e "${RED}Falha ao instalar o Nginx. Abortando.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Nginx instalado com sucesso.${NC}"
else
    echo -e "${GREEN}Nginx já está instalado.${NC}"
fi

# Criar diretório para o site
SITE_DIR="/var/www/spositech-creator"
echo -e "${YELLOW}Criando diretório ${SITE_DIR}...${NC}"
mkdir -p $SITE_DIR
if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao criar diretório. Verifique as permissões.${NC}"
    exit 1
fi

# Copiar arquivos do projeto
echo -e "${YELLOW}Copiando arquivos do projeto...${NC}"
cp -r index.html js/ css/ $SITE_DIR/
if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao copiar arquivos. Verifique as permissões.${NC}"
    exit 1
fi

# Configurar permissões
echo -e "${YELLOW}Configurando permissões...${NC}"
chown -R www-data:www-data $SITE_DIR
chmod -R 755 $SITE_DIR

# Copiar arquivo de configuração do Nginx
echo -e "${YELLOW}Configurando Nginx...${NC}"
cp spositech-creator.conf /etc/nginx/sites-available/
if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao copiar arquivo de configuração do Nginx. Verifique as permissões.${NC}"
    exit 1
fi

# Ativar o site
ln -sf /etc/nginx/sites-available/spositech-creator.conf /etc/nginx/sites-enabled/

# Editar arquivo hosts para teste local (opcional)
echo -e "${YELLOW}Deseja adicionar uma entrada no arquivo /etc/hosts para teste local? (s/n)${NC}"
read -r resposta
if [[ "$resposta" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Adicionando entrada no arquivo hosts...${NC}"
    grep -qxF "127.0.0.1 spositech-creator.seu-dominio.com" /etc/hosts || echo "127.0.0.1 spositech-creator.seu-dominio.com" >> /etc/hosts
    echo -e "${GREEN}Entrada adicionada com sucesso.${NC}"
fi

# Verificar configuração do Nginx
echo -e "${YELLOW}Verificando configuração do Nginx...${NC}"
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}Falha na verificação da configuração do Nginx. Verifique o arquivo de configuração.${NC}"
    exit 1
fi

# Reiniciar Nginx
echo -e "${YELLOW}Reiniciando Nginx...${NC}"
systemctl restart nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}Falha ao reiniciar o Nginx. Verifique o status do serviço.${NC}"
    exit 1
fi

echo -e "${GREEN}Implantação concluída com sucesso!${NC}"
echo -e "${YELLOW}Acesse seu site em: http://spositech-creator.seu-dominio.com${NC}"
echo -e "${YELLOW}Lembre-se de:${NC}"
echo -e "  ${YELLOW}1. Editar o arquivo ${RED}spositech-creator.conf${YELLOW} e substituir 'spositech-creator.seu-dominio.com' pelo seu domínio real${NC}"
echo -e "  ${YELLOW}2. Configurar os registros DNS para apontar para o IP deste servidor${NC}"
echo -e "  ${YELLOW}3. Para habilitar HTTPS, descomente as seções SSL no arquivo de configuração e obtenha um certificado SSL${NC}"
echo -e "     ${YELLOW}Você pode usar o Certbot para obter certificados SSL Let's Encrypt gratuitamente:${NC}"
echo -e "     ${GREEN}sudo apt-get install certbot python3-certbot-nginx${NC}"
echo -e "     ${GREEN}sudo certbot --nginx -d spositech-creator.seu-dominio.com${NC}" 