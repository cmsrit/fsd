const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const alertContainer = document.getElementById('alertContainer');

// Category definitions with icons and colors
const categories = {
  video: {
    name: 'Video',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 10,16 16,12" fill="currentColor"/></svg>`,
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'm4v', '3gp'],
    color: '#C2185B',
    bgColor: '#FCE4EC'
  },
  audio: {
    name: 'Audio',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    extensions: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'wma', 'm4a', 'aiff'],
    color: '#7B1FA2',
    bgColor: '#F3E5F5'
  },
  images: {
    name: 'Images',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'heic'],
    color: '#1E88E5',
    bgColor: '#E3F2FD'
  },
  documents: {
    name: 'Documents',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'odt', 'ods', 'odp'],
    color: '#2E7D32',
    bgColor: '#E8F5E9'
  },
  others: {
    name: 'Others',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    extensions: [], // Catch-all
    color: '#FF8C42',
    bgColor: '#FFF4E6'
  }
};

// File input change handler
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    const file = e.target.files[0];
    fileNameDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
  }
});

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    const file = e.dataTransfer.files[0];
    fileNameDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
  }
});

// Upload file function
function uploadFile() {
  const file = fileInput.files[0];
  if (!file) {
    showAlert('Please select a file first', 'error');
    return;
  }

  console.log('Uploading file:', file.name, file.size, 'bytes');

  uploadBtn.classList.add('loading');

  const formData = new FormData();
  formData.append('file', file);

  fetch('/upload', {
    method: 'POST',
    body: formData,
  })
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        let errorMsg;
        try {
          const error = JSON.parse(text);
          errorMsg = error.message || error.error || 'Upload failed';
        } catch {
          errorMsg = text || 'Upload failed';
        }
        throw new Error(errorMsg);
      }
      return res.text();
    })
    .then((msg) => {
      console.log('Upload successful:', msg);
      uploadBtn.classList.remove('loading');
      fileInput.value = '';
      fileNameDisplay.textContent = '';
      showAlert('File uploaded successfully!', 'success');
      listFiles();
    })
    .catch((err) => {
      console.error('Upload error:', err);
      uploadBtn.classList.remove('loading');
      showAlert(err.message, 'error');
    });
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get file category based on extension
function getFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  for (const [key, category] of Object.entries(categories)) {
    if (key !== 'others' && category.extensions.includes(ext)) {
      return key;
    }
  }
  return 'others';
}

// Get colorful file icon based on extension
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  // File type configurations with colors
  const fileTypes = {
    // PDFs - Red
    pdf: { color: '#E53935', bgColor: '#FFEBEE', icon: 'doc' },
    // Images - Blue
    jpg: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    jpeg: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    png: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    gif: { color: '#8E24AA', bgColor: '#F3E5F5', icon: 'image' },
    webp: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    svg: { color: '#FF9800', bgColor: '#FFF3E0', icon: 'image' },
    bmp: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    ico: { color: '#1E88E5', bgColor: '#E3F2FD', icon: 'image' },
    // Documents - Blue/Navy
    doc: { color: '#1565C0', bgColor: '#E3F2FD', icon: 'doc' },
    docx: { color: '#1565C0', bgColor: '#E3F2FD', icon: 'doc' },
    txt: { color: '#546E7A', bgColor: '#ECEFF1', icon: 'doc' },
    rtf: { color: '#1565C0', bgColor: '#E3F2FD', icon: 'doc' },
    // Spreadsheets - Green
    xls: { color: '#2E7D32', bgColor: '#E8F5E9', icon: 'sheet' },
    xlsx: { color: '#2E7D32', bgColor: '#E8F5E9', icon: 'sheet' },
    csv: { color: '#43A047', bgColor: '#E8F5E9', icon: 'sheet' },
    // Presentations - Orange
    ppt: { color: '#D84315', bgColor: '#FBE9E7', icon: 'slides' },
    pptx: { color: '#D84315', bgColor: '#FBE9E7', icon: 'slides' },
    // Archives - Brown/Amber
    zip: { color: '#795548', bgColor: '#EFEBE9', icon: 'archive' },
    rar: { color: '#795548', bgColor: '#EFEBE9', icon: 'archive' },
    '7z': { color: '#795548', bgColor: '#EFEBE9', icon: 'archive' },
    tar: { color: '#795548', bgColor: '#EFEBE9', icon: 'archive' },
    gz: { color: '#795548', bgColor: '#EFEBE9', icon: 'archive' },
    // Audio - Purple
    mp3: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    wav: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    flac: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    ogg: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    aac: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    m4a: { color: '#7B1FA2', bgColor: '#F3E5F5', icon: 'audio' },
    // Video - Pink/Red
    mp4: { color: '#C2185B', bgColor: '#FCE4EC', icon: 'video' },
    mov: { color: '#C2185B', bgColor: '#FCE4EC', icon: 'video' },
    avi: { color: '#C2185B', bgColor: '#FCE4EC', icon: 'video' },
    mkv: { color: '#C2185B', bgColor: '#FCE4EC', icon: 'video' },
    webm: { color: '#C2185B', bgColor: '#FCE4EC', icon: 'video' },
    // Code - Various
    js: { color: '#F9A825', bgColor: '#FFFDE7', icon: 'code' },
    ts: { color: '#1976D2', bgColor: '#E3F2FD', icon: 'code' },
    html: { color: '#E65100', bgColor: '#FFF3E0', icon: 'code' },
    css: { color: '#1565C0', bgColor: '#E3F2FD', icon: 'code' },
    json: { color: '#616161', bgColor: '#FAFAFA', icon: 'code' },
    py: { color: '#1976D2', bgColor: '#E3F2FD', icon: 'code' },
  };
  
  const defaultType = { color: '#FF8C42', bgColor: '#FFF4E6', icon: 'file' };
  const fileType = fileTypes[ext] || defaultType;
  
  // Generate SVG based on icon type
  const iconPaths = {
    image: `<rect x="4" y="4" width="16" height="16" rx="2" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="9" cy="9" r="2" fill="currentColor"/>
            <path d="M4 16L9 12L12 14L16 10L20 14V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V16Z" fill="currentColor" opacity="0.5"/>`,
    doc: `<path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
          <path d="M14 2V8H20" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
          <line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" stroke-width="1.5"/>
          <line x1="8" y1="17" x2="14" y2="17" stroke="currentColor" stroke-width="1.5"/>`,
    sheet: `<path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14 2V8H20" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
            <rect x="7" y="12" width="10" height="7" rx="1" stroke="currentColor" stroke-width="1" fill="none"/>
            <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" stroke-width="1"/>
            <line x1="11" y1="12" x2="11" y2="19" stroke="currentColor" stroke-width="1"/>`,
    slides: `<rect x="3" y="4" width="18" height="14" rx="2" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
             <rect x="6" y="7" width="8" height="5" rx="1" fill="currentColor" opacity="0.3"/>
             <line x1="6" y1="15" x2="18" y2="15" stroke="currentColor" stroke-width="1.5"/>`,
    archive: `<path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
              <rect x="10" y="4" width="4" height="2" fill="currentColor"/>
              <rect x="10" y="8" width="4" height="2" fill="currentColor"/>
              <rect x="10" y="12" width="4" height="2" fill="currentColor"/>
              <rect x="9" y="15" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1" fill="currentBg"/>`,
    audio: `<circle cx="12" cy="12" r="9" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            <circle cx="12" cy="12" r="1" fill="currentBg"/>`,
    video: `<rect x="3" y="5" width="18" height="14" rx="2" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
            <polygon points="10,9 10,15 15,12" fill="currentColor"/>`,
    code: `<path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
           <path d="M14 2V8H20" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
           <path d="M9 13L7 15L9 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
           <path d="M15 13L17 15L15 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
    file: `<path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>
           <path d="M14 2V8H20" fill="currentBg" stroke="currentColor" stroke-width="1.5"/>`
  };
  
  const iconPath = iconPaths[fileType.icon] || iconPaths.file;
  
  return {
    svg: `<svg viewBox="0 0 24 24" fill="none" style="--icon-color: ${fileType.color}; --icon-bg: ${fileType.bgColor};">
            <style>
              svg { color: var(--icon-color); }
              [fill="currentBg"] { fill: var(--icon-bg); }
              [fill="currentColor"] { fill: var(--icon-color); }
              [stroke="currentColor"] { stroke: var(--icon-color); }
            </style>
            ${iconPath}
          </svg>`,
    color: fileType.color,
    bgColor: fileType.bgColor
  };
}

// List files from server
function listFiles() {
  console.log('Fetching file list...');

  fetch('/files')
    .then(async (res) => {
      console.log('List files response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        let errorMsg;
        try {
          const error = JSON.parse(text);
          errorMsg = error.message || error.error || 'Failed to fetch files';
        } catch {
          errorMsg = text || 'Failed to fetch files';
        }
        throw new Error(errorMsg);
      }
      return res.json();
    })
    .then((files) => {
      console.log('Files received:', files.length);
      const fileList = document.getElementById('fileList');
      const fileCount = document.getElementById('fileCount');
      
      fileCount.textContent = files.length;
      fileList.innerHTML = '';

      if (files.length === 0) {
        fileList.innerHTML = `
          <div class="empty-state">
            <div class="empty-illustration">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect x="12" y="24" width="56" height="44" rx="4" fill="#FFE4CC"/>
                <path d="M12 32C12 29.79 13.79 28 16 28H64C66.21 28 68 29.79 68 32V64C68 66.21 66.21 68 64 68H16C13.79 68 12 66.21 12 64V32Z" fill="#FFF4E6" stroke="#FFB347" stroke-width="2"/>
                <rect x="24" y="12" width="32" height="8" rx="2" fill="#FFCC5C"/>
                <circle cx="40" cy="48" r="8" fill="#FFE4CC" stroke="#FF8C42" stroke-width="2"/>
              </svg>
            </div>
            <p class="empty-title">No files yet</p>
            <p class="empty-subtitle">Upload your first file to get started</p>
          </div>
        `;
        return;
      }

      // Group files by category
      const groupedFiles = {
        video: [],
        audio: [],
        images: [],
        documents: [],
        others: []
      };

      files.forEach(file => {
        const category = getFileCategory(file.name);
        groupedFiles[category].push(file);
      });

      // Render each non-empty category
      const categoryOrder = ['video', 'audio', 'images', 'documents', 'others'];
      let animationIndex = 0;

      categoryOrder.forEach(categoryKey => {
        const filesInCategory = groupedFiles[categoryKey];
        if (filesInCategory.length === 0) return;

        const category = categories[categoryKey];
        
        // Create section
        const section = document.createElement('div');
        section.className = `category-section category-${categoryKey}`;
        section.style.setProperty('--category-color', category.color);
        section.style.setProperty('--category-bg', category.bgColor);
        
        // Section header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
          <div class="category-icon">${category.icon}</div>
          <span class="category-name">${category.name}</span>
          <span class="category-count">${filesInCategory.length}</span>
        `;
        section.appendChild(header);
        
        // Files grid
        const grid = document.createElement('div');
        grid.className = 'category-grid';
        
        filesInCategory.forEach((f) => {
          const iconData = getFileIcon(f.name);
          
          const item = document.createElement('div');
          item.className = 'file-icon-item';
          item.style.animationDelay = `${animationIndex * 0.04}s`;
          animationIndex++;
          
          item.innerHTML = `
            <div class="file-icon-graphic">${iconData.svg}</div>
            <div class="file-icon-name" title="${f.name}">${f.name}</div>
            <div class="file-icon-size">${formatFileSize(f.size)}</div>
            <button class="file-icon-download" onclick="event.stopPropagation(); downloadFile('${f.name.replace(/'/g, "\\'")}')">Download</button>
          `;
          
          // Click on item to download
          item.addEventListener('click', () => {
            downloadFile(f.name);
          });
          
          grid.appendChild(item);
        });
        
        section.appendChild(grid);
        fileList.appendChild(section);
      });
    })
    .catch((err) => {
      console.error('List files error:', err);
      showAlert('Error loading files: ' + err.message, 'error');
    });
}

// Create and show alert
function createAlert(type, message) {
  const alertEl = document.createElement('div');
  alertEl.className = `alert ${type}`;
  
  const titles = {
    success: 'Success',
    error: 'Error',
    info: 'Info'
  };
  
  alertEl.innerHTML = `
    <div class="alert-title">${titles[type] || 'Notice'}</div>
    <div class="alert-message">${message}</div>
    <button class="alert-close" onclick="this.parentElement.remove()">&times;</button>
  `;
  
  setTimeout(() => {
    alertEl.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    alertEl.classList.remove('show');
    setTimeout(() => {
      alertEl.remove();
    }, 400);
  }, 5000);
  
  return alertEl;
}

function showAlert(message, type = 'info') {
  const alertEl = createAlert(type, message);
  alertContainer.appendChild(alertEl);
}

// Download file
function downloadFile(filename) {
  showAlert('Preparing download...', 'info');
  
  fetch(`/download/${encodeURIComponent(filename)}`)
    .then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        let errorMsg;
        try {
          const error = JSON.parse(text);
          errorMsg = error.message || error.error || 'Download failed';
        } catch {
          errorMsg = text || 'Download failed';
        }
        throw new Error(errorMsg);
      }
      return res.json();
    })
    .then((data) => {
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showAlert(`Download started: ${data.filename}`, 'success');
    })
    .catch((err) => {
      console.error('Download error:', err);
      showAlert('Download failed: ' + err.message, 'error');
    });
}

// Initialize on page load
window.onload = listFiles;
