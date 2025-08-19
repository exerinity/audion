const max_err_boxes = 5;
const err_container = document.createElement('div');
err_container.style.position = 'fixed';
err_container.style.bottom = '20px';
err_container.style.right = '20px';
err_container.style.display = 'flex';
err_container.style.flexDirection = 'column-reverse';
err_container.style.gap = '10px';
document.body.appendChild(err_container);

function throw_error(msg, success = false) {
    const err_box = document.createElement('div');
    err_box.className = 'error-box';
    err_box.style.background = success ? '#047500ff' : '#da0000ff';
    err_box.style.color = 'white';
    err_box.style.padding = '10px 20px';
    err_box.style.borderRadius = '4px';
    err_box.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    err_box.style.opacity = '1';
    err_box.style.transition = 'opacity 1s ease';
    err_box.innerHTML = `<i class="fa-solid ${success ? 'fa-check' : 'fa-triangle-exclamation'}"></i> ${msg}`;

    err_container.appendChild(err_box);

    setTimeout(() => {
        err_box.style.opacity = '0';
        setTimeout(() => {
            err_box.remove();
        }, 1000);
    }, 5000);

    if (err_container.children.length > max_err_boxes) {
        err_container.firstChild.remove();
    }

    if (!success) {
        elements.error_sound.currentTime = 0;
        elements.error_sound.play();
    }

    if (!success) console.error(msg);
}