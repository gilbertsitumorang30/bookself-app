document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.children[4].value === "Submit") {
      addBook();
    }
  });
  cari.addEventListener("input", searchBook);
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const addBook = () => {
  const judulBuku = document.getElementById("judul").value;
  const penulisBuku = document.getElementById("penulis").value;
  const tahunBuku = document.getElementById("tahun").value;
  const diBaca = document.getElementById("dibaca").checked;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    judulBuku,
    penulisBuku,
    tahunBuku,
    diBaca
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  closeModal();
};

const generateId = () => {
  return +new Date();
};

const generateBookObject = (id, judul, penulis, tahun, isComplete) => {
  return {
    id,
    judul,
    penulis,
    tahun,
    isComplete,
  };
};

const books = [];
const RENDER_EVENT = "render-book";

document.addEventListener(RENDER_EVENT, () => {
  const cari = document.getElementById("cari").value;
  const uncompletedBookList = document.getElementById("rak-belum");
  const completedBookList = document.getElementById("rak-selesai");
  uncompletedBookList.innerHTML = "";
  completedBookList.innerHTML = "";
  const titleRakBelum = document.createElement("h1");
  titleRakBelum.innerText = "Belum selesai dibaca";
  uncompletedBookList.appendChild(titleRakBelum);
  const titleRakSelesai = document.createElement("h1");
  titleRakSelesai.innerText = "Selesai dibaca";
  completedBookList.appendChild(titleRakSelesai);

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBookList.append(bookElement);
    } else {
      completedBookList.append(bookElement);
    }
  }
  if (cari) {
    searchBook();
  }
});

const makeBook = (bookObject) => {
  const itemContainer = document.createElement("div");
  itemContainer.classList.add("item-container");
  itemContainer.setAttribute("id", `book-${bookObject.id}`);

  const item = document.createElement("div");
  item.classList.add("item");

  const img = document.createElement("img");
  img.setAttribute(
    "src",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Placeholder_book.svg/1200px-Placeholder_book.svg.png"
  );
  img.setAttribute("alt", "book");

  const textContainer = document.createElement("div");
  textContainer.classList.add("text-container");

  const judul = document.createElement("p");
  judul.classList.add("judul");
  judul.innerText = bookObject.judul;

  const penulis = document.createElement("p");
  penulis.classList.add("penulis");
  penulis.innerText = `Penulis : ${bookObject.penulis}`;

  const tahun = document.createElement("p");
  tahun.classList.add("tahun");
  tahun.innerText = `Tahun : ${bookObject.tahun}`;

  const btnContainer = document.createElement("div");
  btnContainer.classList.add("btn-container");

  const btnRed = document.createElement("div");
  btnRed.classList.add("item-btn", "red");
  btnRed.innerText = "Hapus buku";
  btnRed.addEventListener("click", () => {
    removeBook(bookObject.id);
  });

  const btnEdit = document.createElement("div");
  btnEdit.innerHTML = "edit";
  btnEdit.classList.add("btn-edit");

  btnEdit.addEventListener("click", () => {
    editBook(bookObject.id);
  });

  const btnGreen = document.createElement("div");
  btnGreen.classList.add("item-btn", "green");

  if (bookObject.isComplete) {
    btnGreen.innerText = "Belum selesai dibaca";
    btnGreen.addEventListener("click", () => {
      moveBookToUncompleted(bookObject.id);
    });
  } else {
    btnGreen.innerText = "Selesai dibaca";
    btnGreen.addEventListener("click", () => {
      moveBookToCompleted(bookObject.id);
    });
  }

  textContainer.appendChild(judul);
  textContainer.appendChild(penulis);
  textContainer.appendChild(tahun);
  btnContainer.appendChild(btnRed);
  btnContainer.appendChild(btnGreen);
  item.appendChild(img);
  item.appendChild(textContainer);
  itemContainer.appendChild(item);
  itemContainer.appendChild(btnContainer);
  itemContainer.appendChild(btnEdit);

  return itemContainer;
};

const editBook = (bookId) => {
  const bookTarget = findBook(bookId);
  const modalTitle = document.querySelector(".modal-title");
  modalTitle.children[0].innerText = "Edit Buku";
  if (bookTarget == null) return;
  const judulBuku = document.getElementById("judul");
  judulBuku.value = bookTarget.judul;
  const penulisBuku = document.getElementById("penulis");
  penulisBuku.value = bookTarget.penulis;
  const tahunBuku = document.getElementById("tahun");
  tahunBuku.value = bookTarget.tahun;
  const diBaca = document.getElementById("dibaca");
  diBaca.checked = bookTarget.isComplete;
  const btnSubmit = document.querySelector(".btn-submit");
  btnSubmit.value = "Simpan Perubahan";
  openModal();
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.children[4].value !== "Submit") {
      bookTarget.judul = judulBuku.value;
      bookTarget.penulis = penulisBuku.value;
      bookTarget.tahun = tahunBuku.value;
      bookTarget.isComplete = diBaca.checked;
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveData();
      closeModal();
    }
  });
};

const moveBookToCompleted = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }

  return null;
};

const moveBookToUncompleted = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const removeBook = (bookId) => {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
};

const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSELF_APPS";

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};
const searchBook = () => {
  const cari = document.getElementById("cari").value;
  const bookCards = document.querySelectorAll(".item-container");
  bookCards.forEach((element) => {
    const dicari = cari;
    const judulBuku = element.children[0].children[1].children[0].innerHTML;
    if (judulBuku.toLocaleLowerCase().includes(dicari.toLocaleLowerCase())) {
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  });
};

const clearForm = () => {
  const judulBuku = document.getElementById("judul");
  const penulisBuku = document.getElementById("penulis");
  const tahunBuku = document.getElementById("tahun");
  const diBaca = document.getElementById("dibaca");
  judulBuku.value = "";
  penulisBuku.value = "";
  tahunBuku.value = "";
  diBaca.checked = false;
};

const modalContainer = document.querySelector(".modal-container");
const tambah = document.getElementById("tambah");
const close = document.getElementById("close");

const openModal = () => {
  modalContainer.style.display = "flex";
};

const closeModal = () => {
  modalContainer.style.display = "none";
};

modalContainer.addEventListener("click", (e) => {
  if (e.target.className === "modal-overlay") {
    closeModal();
  }
});

close.addEventListener("click", closeModal);
tambah.addEventListener("click", () => {
  const modalTitle = document.querySelector(".modal-title");
  modalTitle.children[0].innerText = "Tambah Buku";
  clearForm();
  openModal();
});
