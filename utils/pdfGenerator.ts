import jsPDF from 'jspdf';

interface ProjectData {
  name: string;
  clientName: string;
  collectionName: string;
  createdAt: string;
  deliveryDate?: string;
  customizationDescription: string[];
  productionNotes?: string;
  renderImages: { renderUrl: string; item: { name: string } }[];
}

export const generatePDF = async (project: ProjectData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = 20;

  // --- Função Auxiliar para Adicionar Texto ---
  const addText = (text: string, size: number = 12, isBold: boolean = false, color: string = '#594E4A') => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Quebra de linha automática
    const splitText = doc.splitTextToSize(text, contentWidth);
    doc.text(splitText, margin, yPos);
    
    // Atualiza a posição Y baseada na altura do texto adicionado
    const textHeight = (doc.getTextDimensions(splitText).h);
    yPos += textHeight + 6; // +6 de espaçamento
  };

  // --- Função Auxiliar para Carregar Imagem como Base64 ---
  const getImageData = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  // --- PÁGINA 1: Informações e Especificações ---

  // Cabeçalho
  addText('Bebelize - Ficha Técnica de Produção', 18, true, '#A68E80');
  yPos += 10;

  // Dados do Projeto
  addText(`Projeto: ${project.name}`, 14, true);
  addText(`Cliente: ${project.clientName}`, 12);
  addText(`Coleção: ${project.collectionName}`, 12);
  addText(`Data de Criação: ${project.createdAt}`, 12);
  if (project.deliveryDate) {
    addText(`Previsão de Entrega: ${project.deliveryDate}`, 12, true, '#D9534F'); // Vermelho se tiver data
  }
  
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos); // Linha divisória
  yPos += 15;

  // Especificações Técnicas
  addText('Especificações Técnicas:', 14, true, '#A68E80');
  
  project.customizationDescription.forEach((desc) => {
    // Verifica se precisa de nova página
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    addText(desc, 11);
  });

  yPos += 10;

  // Notas de Produção (se houver)
  if (project.productionNotes) {
    if (yPos > 250) { doc.addPage(); yPos = 20; }
    addText('Notas de Produção:', 14, true, '#A68E80');
    addText(project.productionNotes, 11, false, '#333333');
  }

  // --- PÁGINAS SEGUINTES: Imagens ---
  
  if (project.renderImages.length > 0) {
    for (const imgData of project.renderImages) {
      doc.addPage();
      yPos = 20;

      addText(`Visualização: ${imgData.item.name || 'Item do Projeto'}`, 14, true, '#A68E80');
      
      try {
        const base64Img = await getImageData(imgData.renderUrl);
        
        // Calcula proporção para ajustar a imagem na página A4
        const imgProps = doc.getImageProperties(base64Img);
        const imgRatio = imgProps.width / imgProps.height;
        const maxImgWidth = contentWidth;
        const maxImgHeight = 220; // Deixa espaço para rodapé
        
        let finalWidth = maxImgWidth;
        let finalHeight = finalWidth / imgRatio;

        if (finalHeight > maxImgHeight) {
          finalHeight = maxImgHeight;
          finalWidth = finalHeight * imgRatio;
        }

        // Centraliza horizontalmente
        const xOffset = margin + (contentWidth - finalWidth) / 2;

        doc.addImage(base64Img, 'PNG', xOffset, yPos, finalWidth, finalHeight);
      } catch (error) {
        console.error("Erro ao carregar imagem para o PDF", error);
        addText("(Erro ao carregar a imagem visual)", 10, false, 'red');
      }
    }
  }

  // Salva o arquivo
  const fileName = `Ficha_Tecnica_${project.clientName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};