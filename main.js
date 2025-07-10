  // Mengakses elemen HTML
        const video = document.getElementById('video');
        const captureBtn = document.getElementById('capture-btn');
        const printBtn = document.getElementById('print-btn');
        const saveBtn = document.getElementById('save-btn');
        const clearBtn = document.getElementById('clear-btn');
        const canvas = document.getElementById('canvas');
        const photos = document.getElementById('photos');

        // Array untuk menyimpan semua foto yang diambil
        let capturedPhotos = [];

        // Mengakses webcam
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((err) => {
                console.error("Error accessing the webcam: ", err);
                alert("Tidak dapat mengakses webcam. Pastikan Anda memberikan izin.");
            });

        // Menangkap foto
        captureBtn.addEventListener('click', () => {
            // Pastikan video sudah siap
            if (video.readyState !== video.HAVE_ENOUGH_DATA) {
                alert("Video belum siap. Tunggu sebentar.");
                return;
            }

            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Mengubah canvas menjadi gambar
            const imgUrl = canvas.toDataURL('image/png');
            
            // Membuat objek foto dengan ID unik
            const photoId = Date.now();
            const photoData = {
                id: photoId,
                url: imgUrl
            };
            
            // Menyimpan foto ke array
            capturedPhotos.push(photoData);

            // Membuat dan menambahkan foto ke DOM
            addPhotoToDOM(photoData);
        });

        // Fungsi untuk menambahkan foto ke DOM
        function addPhotoToDOM(photoData) {
            // Membuat container untuk foto dan tombol hapus
            const photoContainer = document.createElement('div');
            photoContainer.className = 'photo-container';
            photoContainer.dataset.photoId = photoData.id;

            const img = document.createElement('img');
            img.src = photoData.url;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.title = 'Hapus foto ini';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePhoto(photoData.id);
            });

            // Menambahkan elemen ke container
            photoContainer.appendChild(img);
            photoContainer.appendChild(deleteBtn);

            // Menambahkan container ke dalam #photos
            photos.appendChild(photoContainer);
            
            // Animasi kecil untuk feedback visual
            photoContainer.style.transform = 'scale(0.9)';
            setTimeout(() => {
                photoContainer.style.transform = 'scale(1)';
            }, 100);
        }

        // Fungsi untuk menghapus foto
        function deletePhoto(photoId) {
            if (confirm('Apakah Anda yakin ingin menghapus foto ini?')) {
                // Hapus dari DOM
                const photoElement = document.querySelector(`.photo-container[data-photo-id="${photoId}"]`);
                if (photoElement) {
                    photoElement.remove();
                }
                
                // Hapus dari array capturedPhotos
                capturedPhotos = capturedPhotos.filter(photo => photo.id !== photoId);
                
                console.log('Foto dihapus. Total foto tersisa:', capturedPhotos.length);
            }
        }

        // Fungsi untuk menghapus semua foto
        function clearAllPhotos() {
            if (capturedPhotos.length === 0) {
                alert('Tidak ada foto yang bisa dihapus.');
                return;
            }

            if (confirm('Apakah Anda yakin ingin menghapus semua foto?')) {
                // Hapus semua foto dari DOM
                photos.innerHTML = '';
                
                // Kosongkan array capturedPhotos
                capturedPhotos = [];
                
                console.log('Semua foto telah dihapus.');
            }
        }

        // Mencetak foto
        printBtn.addEventListener('click', () => {
            if (capturedPhotos.length === 0) {
                alert('Tidak ada foto untuk dicetak.');
                return;
            }
            window.print();
        });

        // Menyimpan foto ke gallery
        saveBtn.addEventListener('click', () => {
            if (capturedPhotos.length === 0) {
                alert('Tidak ada foto yang bisa disimpan.');
                return;
            }

            // Simpan semua foto yang ada
            capturedPhotos.forEach((photo) => {
                savePhotoToGallery(photo.url, `photobox_${photo.id}.png`);
            });
            
            alert(`Berhasil menyimpan ${capturedPhotos.length} foto ke gallery!`);
        });

        // Menghapus semua foto
        clearBtn.addEventListener('click', clearAllPhotos);

        // Fungsi untuk menyimpan gambar ke gallery
        function savePhotoToGallery(dataUrl, filename) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Untuk mobile devices
            if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
                const blob = dataURLtoBlob(dataUrl);
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            }
        }

        // Fungsi untuk mengubah data URL ke Blob
        function dataURLtoBlob(dataUrl) {
            const arr = dataUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            return new Blob([u8arr], { type: mime });
        }

        // Membersihkan semua resource ketika window ditutup
        window.addEventListener('beforeunload', () => {
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        });