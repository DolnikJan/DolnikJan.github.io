document.addEventListener('DOMContentLoaded', () => {

    // helper to create per-cell menu
    function createCellMenu(cell) {
        const existing = document.getElementById(cell.id + '_menu');
        if (existing) {
            existing.remove();
            return;
        }

        const rect = cell.getBoundingClientRect();
        const menu = document.createElement('div');
        menu.id = cell.id + '_menu';
        menu.style.position = 'absolute';
        menu.style.left = (rect.right + window.scrollX + 8) + 'px';
        menu.style.top = (rect.top + window.scrollY) + 'px';
        menu.style.minWidth = '140px';
        menu.style.padding = '8px';
        menu.style.backgroundColor = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.boxShadow = '0 4px 10px rgba(0,0,0,0.12)';
        menu.style.borderRadius = '4px';
        menu.style.zIndex = '9999';
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
        menu.style.gap = '6px';

        function makeBtn(text, onClick) {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = text;
            b.style.padding = '6px 8px';
            b.style.border = '1px solid #bbb';
            b.style.background = '#f7f7f7';
            b.style.cursor = 'pointer';
            b.addEventListener('click', (e) => { e.stopPropagation(); onClick(e); });
            return b;
        }

        menu.appendChild(makeBtn('Duplicate', () => {
            const clone = cell.cloneNode(true);
            // unique id
            clone.id = clone.id + '_dup' + Date.now();
            // fix imgs inside clone: give unique ids, set draggable and dataset.sourceCell, add dragstart handler
            const imgs = clone.querySelectorAll('img');
            imgs.forEach(img => {
                img.id = img.id + '_dup' + Date.now();
                img.draggable = true;
                img.dataset.sourceCell = clone.id;
                img.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.id);
                    e.dataTransfer.setData('text/source-cell', clone.id);
                });
            });
            cell.parentElement.insertBefore(clone, cell.nextSibling);
        }));

        menu.appendChild(makeBtn('Remove', () => {
            menu.remove();
            cell.remove();
        }));

        menu.appendChild(makeBtn('Close', () => {
            menu.remove();
        }));

        document.body.appendChild(menu);

        const onDocClick = (e) => {
            if (!menu.contains(e.target) && e.target !== cell) {
                menu.remove();
                document.removeEventListener('click', onDocClick);
            }
        };
        setTimeout(() => document.addEventListener('click', onDocClick), 0);
    }

    // Menu se součástkama
    const parts_menu = document.createElement("div");
    parts_menu.className = "side-tab";
    document.body.appendChild(parts_menu);

    source = addToPartsMenu("./images/source.svg", parts_menu);
    lightbulb = addToPartsMenu("./images/light_bulb.svg", parts_menu);

    // Grid
    const gridContainer = document.getElementById('grid-container');
    for (let i = 0; i < 25; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell_grid');

        // allow per-cell menu on double click
        cell.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            createCellMenu(cell);
        });

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

            const dataPlain = e.dataTransfer.getData('text/plain');
            const draggedElement = document.getElementById(dataPlain);

            if (draggedElement && cell.children.length === 0) {
                cell.appendChild(draggedElement);

                if (draggedElement.tagName === 'IMG') {
                    draggedElement.style.width = '100%';
                    draggedElement.style.height = '100%';
                    draggedElement.style.objectFit = 'contain';
                }

                // update sourceCell dataset for the moved element
                draggedElement.dataset.sourceCell = cell.id;

                // transfer menu: remove old menu (if any) and create new menu for this cell
                const srcCellId = e.dataTransfer.getData('text/source-cell');
                if (srcCellId) {
                    const oldMenu = document.getElementById(srcCellId + '_menu');
                    if (oldMenu) oldMenu.remove();
                }
                // create a menu attached to the new cell (if there was a menu on the source)
                if (e.dataTransfer.getData('text/source-cell')) {
                    createCellMenu(cell);
                }
            }
        });

        gridContainer.appendChild(cell);
    }
});

// top-level addToPartsMenu
function addToPartsMenu(imageLink, menu) {
    console.log("addToPartsMenu");
    const cell = document.createElement('div');
    cell.classList.add('cell_grid');
    cell.id = createId(imageLink);
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

            // update dataset to new owner cell
            draggedElement.dataset.sourceCell = cell.id;

            // transfer menu from source to this cell if present
            const srcCellId = e.dataTransfer.getData('text/source-cell');
            if (srcCellId) {
                const oldMenu = document.getElementById(srcCellId + '_menu');
                if (oldMenu) oldMenu.remove();
            }
            if (e.dataTransfer.getData('text/source-cell')) {
                // create a menu for this cell
                // createCellMenu is in the global scope (defined in DOMContentLoaded)
                // but ensure it's available by calling via window
                if (typeof window.createCellMenu === 'function') {
                    window.createCellMenu(cell);
                } else {
                    // fallback: try to call global name if attached
                    try { createCellMenu(cell); } catch (e) {}
                }
            }
        }
    });

    // observe replaced child to re-create image if removed
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                console.log("removed");

                const newImage = document.createElement('img');
                newImage.src = imageLink;
                newImage.id = createId(imageLink);
                newImage.draggable = true;
                newImage.dataset.sourceCell = cell.id;

                newImage.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', e.target.id);
                    e.dataTransfer.setData('text/source-cell', cell.id);
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
    menu.appendChild(cell);
    const image = document.createElement('img');
    image.src = imageLink;
    image.id = createId(imageLink);
    image.draggable = true;
    image.dataset.sourceCell = cell.id;
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'contain';

    image.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.dataTransfer.setData('text/source-cell', cell.id);
    });

    // dblclick opens a menu for THIS cell
    image.addEventListener('dblclick', (ev) => {
        ev.stopPropagation();
        // createCellMenu was defined inside DOMContentLoaded; ensure global access and call it.
        if (typeof window.createCellMenu === 'function') {
            window.createCellMenu(cell);
        } else {
            try { createCellMenu(cell); } catch (e) {}
        }
    });

    // also allow double clicking the cell itself
    cell.addEventListener('dblclick', (ev) => {
        ev.stopPropagation();
        if (typeof window.createCellMenu === 'function') {
            window.createCellMenu(cell);
        } else {
            try { createCellMenu(cell); } catch (e) {}
        }
    });

    console.log("done");

    cell.appendChild(image);
    return cell;
}

// expose createCellMenu to global scope so drop handlers can call it
// (this relies on the function being created earlier in DOMContentLoaded; attach fallback no-op to avoid errors)
if (typeof window.createCellMenu !== 'function') {
    // placeholder; real implementation is attached inside DOMContentLoaded
    window.createCellMenu = function(cell) {
        // try to call the local function if available
        try { createCellMenu(cell); } catch (e) {}
    };
}

let id_count = 0;
function createId(name) {
    id_count++;
    return name + id_count.toString();
}