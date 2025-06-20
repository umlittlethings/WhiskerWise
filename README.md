# WhiskerWise - Virtual Pet Game

WhiskerWise adalah sebuah game simulasi hewan peliharaan virtual yang interaktif, di mana pemain bertanggung jawab untuk merawat seekor kucing digital bernama Felix. Game ini dibangun dengan JavaScript modern (ES6 Modules) dan memanfaatkan RxJS untuk menangani event dan state secara reaktif.

## ✨ Fitur Utama

- **Sistem Statistik**: Rawat Felix dengan menjaga empat statistik utamanya: Kelaparan (`hunger`), Kebahagiaan (`happiness`), Energi (`energy`), dan Kesehatan (`health`).
- **Aksi Interaktif**: Lakukan berbagai aksi untuk merawat Felix, seperti Memberi Makan (`feed`), Bermain (`play`), Tidur (`sleep`), Mengobati (`heal`), Mengelus (`pet`), dan Membersihkan (`groom`).
- **UI Dinamis**: Antarmuka yang responsif dengan bar status yang diperbarui secara _real-time_, tampilan mood, dan status aktivitas Felix saat ini.
- **Animasi GIF**: Felix ditampilkan dengan berbagai animasi GIF yang lucu sesuai dengan kondisinya, seperti makan, tidur, atau bermain.
- **Perilaku Otonom**: Jika dibiarkan, Felix dapat melakukan aktivitasnya sendiri secara acak, membuatnya terasa lebih hidup.
- **Sistem Level & Skor**: Dapatkan poin (FelixScore) dari setiap aksi positif untuk menaikkan level Felix.
- **Pencapaian (Achievements)**: Buka pencapaian tertentu dengan mencapai milestone dalam game, seperti jumlah total aksi atau skor.
- **Penyimpanan Otomatis**: Progres permainan secara otomatis disimpan di `localStorage` peramban, sehingga Anda dapat melanjutkannya nanti.
- **Pengaturan Kustom**: Pemain dapat mengaktifkan atau menonaktifkan suara, penyimpanan otomatis, dan perilaku otonom melalui menu pengaturan.
- **Pintasan Keyboard**: Gunakan pintasan keyboard (`F` untuk makan, `P` untuk bermain, dll.) untuk interaksi yang lebih cepat.

## 🎮 Cara Bermain

Tujuan utama Anda adalah menjaga agar semua statistik Felix tetap tinggi dan membuatnya bahagia.

1.  **Perhatikan Statistik**: Jaga agar bar statistik tidak turun ke level kritis (di bawah 20%). Statistik yang rendah akan berdampak buruk pada kesehatan Felix.
2.  **Lakukan Aksi**: Gunakan tombol aksi atau pintasan keyboard untuk berinteraksi dengan Felix:
    - **Makan (`F`)**: Meningkatkan status lapar dan sedikit kesehatan.
    - **Main (`P`)**: Meningkatkan kebahagiaan, tetapi menguras energi dan membuat lapar.
    - **Tidur (`S`)**: Memulihkan energi secara signifikan.
    - **Obat (`H`)**: Memulihkan kesehatan Felix.
    - **Elus (`E`)**: Meningkatkan kebahagiaan. Anda juga bisa mengelus dengan mengklik langsung pada Felix.
    - **Bersihkan (`G`)**: Meningkatkan kesehatan dan kebersihan.
3.  **Naikkan Level**: Terus berinteraksi dengan Felix untuk mendapatkan skor dan mencapai level yang lebih tinggi.
4.  **Perhatikan Notifikasi**: Game akan memberikan notifikasi penting, misalnya saat Felix sangat lapar atau ketika Anda membuka sebuah pencapaian.

## 🔧 Cara Menjalankan

Proyek ini menggunakan ES Modules, sehingga memerlukan server lokal untuk menjalankannya dengan benar agar tidak terkendala masalah CORS.

1.  **Unduh File**: Pastikan semua file berada dalam satu direktori.
2.  **Jalankan Server Lokal**: Gunakan ekstensi seperti "Live Server" di Visual Studio Code, atau jalankan server sederhana dengan Python:
    ```bash
    python -m http.server
    ```
3.  **Buka di Peramban**: Buka peramban dan akses `http://localhost:8000` (atau port yang sesuai).

## 🛠️ Teknologi yang Digunakan

- **HTML5**
- **CSS3** (untuk styling)
- **JavaScript (ES6+ Modules)**
- **RxJS**: Digunakan untuk manajemen _event_ dan _state_ secara reaktif, seperti menangani klik tombol, interval game loop, dan dekomposisi statistik.
