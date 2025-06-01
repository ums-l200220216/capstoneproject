document.addEventListener('DOMContentLoaded', () => {
    // ------------------ //
    // Script Upload Area //
    // ------------------ //
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('up-soal');
    const previewImage = document.getElementById('preview-image');
    const removeButton = document.getElementById('remove-image');
    const uploadButton = document.getElementById('up-button');
    const uploadText = uploadArea.querySelector('.text-drag');
    const solveButton = document.getElementById('solve-button');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    // Drag Foto
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    // Drop Foto
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (allowedTypes.includes(file.type)) {
                fileInput.files = files;
                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            } else {
                alert('Hanya file gambar yang diperbolehkan (jpg, png, gif, webp).');
            }
        }
    });

    // Klik tombol upload
    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
    });

    // Klik area upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target === fileInput || e.target === removeButton || e.target.closest('#remove-image')) return;
        e.preventDefault();
        fileInput.click();
    });

    // Preview saat file dipilih
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file && allowedTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                removeButton.style.display = 'block';
                solveButton.style.display = 'block';
                uploadButton.style.display = 'none';
                uploadText.style.display = 'none';
                fileInput.disabled = true;
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert('Hanya file gambar yang diperbolehkan (jpg, png, gif, webp).');
            fileInput.value = '';
        }
    });

    // Hapus gambar
    removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        previewImage.src = '';
        previewImage.style.display = 'none';
        removeButton.style.display = 'none';
        solveButton.style.display = 'none';
        uploadButton.style.display = 'block';
        uploadText.style.display = 'block';
        fileInput.value = '';
        fileInput.disabled = false;
    });

    // Kirim gambar ke server untuk diselesaikan
    solveButton.addEventListener('click', (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            let outputDiv = document.getElementById('output');
            if (!outputDiv) {
                outputDiv = document.createElement('div');
                outputDiv.id = 'output';
                solveButton.parentNode.appendChild(outputDiv);
            }
            outputDiv.innerHTML = '⏳ Sedang memproses...';

            fetch('/solve-from-image', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.result) {
                    outputDiv.innerHTML = `
                        <div style="margin-top: 20px;">
                            <p><strong>Soal (LaTeX):</strong> ${data.result.latex}</p>
                            <p><strong>Hasil:</strong> ${data.result.result}</p>
                            <p><strong>Langkah-langkah:</strong></p>
                            <pre style="white-space: pre-wrap;">${data.result.steps}</pre>
                        </div>
                    `;
                    scrollToCenter();
                } else {
                    outputDiv.innerHTML = `<p style="color:red;">Error: ${data.error || 'Gagal memproses gambar.'}</p>`;
                }
            })
            .catch(err => {
                outputDiv.innerHTML = `<p style="color:red;">Terjadi kesalahan: ${err.message}</p>`;
            });
        }
    });

    // Scroll ke bagian input
    function scrollToCenter() {
        const element = document.getElementById("input-group");
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const elementHeight = element.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTo = elementTop - (windowHeight / 2) + (elementHeight / 2);

        window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
});
