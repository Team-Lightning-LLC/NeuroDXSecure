return content;
    }

     // // Format response for better readability
function formatResponse(content) {
  // Step 1: Bold any text followed by a colon (section headers)
  content = content.replace(/([A-Za-z][A-Za-z\s]+)(:)(\s*)/g, '<strong>$1$2</strong>$3');
  
  // Step 2: Italicize nonverbal observations sections
  content = content.replace(/(\n\n)([^<>\n]*?(Mr\.|Mrs\.|Ms\.|Dr\.)\s+\w+\s+(appears|sits|looks|seems|speaks|gazes|watches|listens)[^<>\n]*?)(?=\n\n|$)/gs, 
    '$1<em>$2</em>');
  
  // Step 3: Further italicize descriptive paragraphs that contain behavioral observations
  content = content.replace(/(\n\n)([^<>\n]*?(anxious|nervous|trembles|shakes|crosses|fidgets|nods|smiles|frowns)[^<>\n]*?)(?=\n\n|$)/gs, 
    '$1<em>$2</em>');
  
  // Step 4: Specifically handle any paragraph labeled as nonverbal observations
  content = content.replace(/<strong>Nonverbal.+?Observations:<\/strong>(\s*)(.*?)(?=\n\n|$)/gs, 
    '<strong>Nonverbal and Emotional Observations:</strong>$1<em>$2</em>');
  
  // Step 5: Style patient quotes in chief complaint
  content = content.replace(/"([^"]+)"/g, '"<em>$1</em>"');
  
  // Step 6: Format numbered lists with proper spacing (keep this from your original)
  content = content.replace(/(\d+\.\s.*?)(\d+\.)/gs, '$1\n\n$2');
  
  // Step 7: Add spacing between paragraphs (keep this from your original)
  content = content.replace(/([^\n])\n([^\n])/g, '$1\n\n$2');
  
  // Step 8: Process existing italics markup (keep this from your original)
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  return content;
    // Return just what the frontend needs
    return res.status(200).json({
      content: formatResponse(data.choices[0].message.content),
      role: "assistant"
    });
  } catch (error) {
    console.error('Server Error:', error);Add commentMore actions
    return res.status(500).json({ error: error.message });
  }
}
