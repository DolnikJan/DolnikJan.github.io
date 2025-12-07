document.addEventListener('DOMContentLoaded', () => {
 

    // Menu se součástkama
    const parts_menu = document.createElement("div");
    parts_menu.className = "side-tab";
    parts_menu.style.position = "absolute";
    parts_menu.style.right = "0";
    parts_menu.style.width = "150px"; 
    parts_menu.style.display = "flex";
    parts_menu.style.flexDirection = "column";
    parts_menu.style.alignItems = "center"; 
    document.body.appendChild(parts_menu);

    
    const cell = document.createElement('div');
    cell.classList.add('cell_grid');
    cell.id = 'cell-1';
    cell.style.width = "100%"; 
    cell.style.height = "100%"; 
    cell.style.justifyContent = "center";
    cell.style.alignItems = "center";
    cell.style.border = "1px solid #ccc"; 
    cell.style.boxSizing = "border-box";

    cell.addEventListener('dragover', (e) => {
        e.preventDefault(); 
    });

    cell.addEventListener('drop', (e) => {
        e.preventDefault();

        const draggedElementId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedElementId);

        if (draggedElement && cell.children.length === 0) {
            cell.appendChild(draggedElement);

         
            if (draggedElement.tagName === 'IMG') {
                draggedElement.style.width = '100%';
                draggedElement.style.height = '100%';
                draggedElement.style.objectFit = 'contain'; 
            }
        }
    });

    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                console.log("removed");

                const newImage = document.createElement('img');
                newImage.src = './images/source.png';
                newImage.id = `source-image-${Date.now()}`; 
                newImage.draggable = true;

                newImage.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.id);
                });
              
                if (cell.children.length === 0) {
                    cell.appendChild(newImage);

                    newImage.style.width = '100%';
                    newImage.style.height = '100%';
                    newImage.style.objectFit = 'contain'; 
                }
            }
        }
    });

    observer.observe(cell, { childList: true });

parts_menu.appendChild(cell);



   
    const image = document.createElement('img');
    image.src = './images/source.png';
    image.id = 'source-image'; 
    image.draggable = true;
    image.style.width = '100%'; 
    image.style.height = '100%'; 
    image.style.objectFit = 'contain'; 

    image.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
    });

    cell.appendChild(image);

    // Grid
    const gridContainer = document.getElementById('grid-container');
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell_grid');

        cell.addEventListener('dragenter', (e) => {
            e.preventDefault();
            cell.style.backgroundColor = 'white';
        });

        cell.addEventListener('dragleave', () => {
            cell.style.backgroundColor = '';
        });

        cell.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.style.backgroundColor = '';

            const draggedElementId = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(draggedElementId);

            if (draggedElement && cell.children.length === 0) {
                cell.appendChild(draggedElement);

              
                if (draggedElement.tagName === 'IMG') {
                    draggedElement.style.width = '100%';
                    draggedElement.style.height = '100%';
                    draggedElement.style.objectFit = 'contain'; 
                }
            }
        });

        gridContainer.appendChild(cell);
    }
});

