import { getPermissions } from './resources.js';
import { getUserProfile } from './userProfiles.js';
import { db, auth } from './firebaseConfig.js';

import {
    collection,
    query,
    orderBy,
    where,
    getDocs,
    serverTimestamp,
    writeBatch,
    doc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// -----------------------------
// LOAD CATEGORY DROPDOWN (FIXED)
// -----------------------------
async function loadCategoryDropdown() {
    const select = document.getElementById("topicCategory");
    if (!select) return;

    const { isStaff } = await getPermissions();
    const categoriesRef = collection(db, "categories");

    let q;

    if (!isStaff) {
        q = query(
            categoriesRef,
            where("appearHidden", "==", false),
            orderBy("order")
        );
    } else {
        q = query(categoriesRef, orderBy("order"));
    }

    try {
        const snapshot = await getDocs(q);
        select.innerHTML = "";

        snapshot.forEach(docSnap => {
            const data = docSnap.data();

            const option = document.createElement("option");
            option.value = docSnap.id;
            option.textContent = data.name;

            select.appendChild(option);
        });

    } catch (e) {
        console.error("Dropdown load error:", e);
    }
}

// -----------------------------
// INIT
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
    await loadCategoryDropdown();

    const dialog = document.getElementById("newTopicContainer");
    const openBtn = document.getElementById("newTopic-btn");
    const cancelBtn = document.getElementById("cancelTopic-btn");

    if (!dialog || !openBtn || !cancelBtn) return;

    const { isStaff, isSuspended, isSilenced } = await getPermissions();

    if (!isStaff && (isSuspended || isSilenced)) {
        openBtn.style.display = "none";
    }

    openBtn.onclick = () => dialog.showModal();
    cancelBtn.onclick = () => {
        dialog.close();
        document.getElementById("newTopicForm").reset();
    };
});

// -----------------------------
// SUBMIT TOPIC
// -----------------------------
document.getElementById("newTopicForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("topicTitle").value.trim();
    const categoryId = document.getElementById("topicCategory").value;
    const content = document.getElementById("topicContent").value.trim();

    const user = auth.currentUser;
    if (!user) return alert("Login required");

    const { isStaff, isSuspended, isSilenced } = await getPermissions();

    if (!isStaff && (isSuspended || isSilenced)) {
        return alert("You cannot post.");
    }

    const profile = await getUserProfile(user.uid);
    const authorName = profile?.displayName || profile?.username || user.email;

    const batch = writeBatch(db);

    const topicRef = doc(collection(db, "topics"));
    const postRef = doc(collection(db, "posts"));

    batch.set(topicRef, {
        title,
        categoryId,
        authorId: user.uid,
        authorName,
        createdAt: serverTimestamp(),
        lastReplyAt: serverTimestamp(),
        replyCount: 0,
        appearDeleted: false
    });

    batch.set(postRef, {
        topicId: topicRef.id,
        authorId: user.uid,
        authorName,
        body: content,
        createdAt: serverTimestamp(),
        appearDeleted: false
    });

    try {
        await batch.commit();
        window.location.href = `/t/${topicRef.id}`;
    } catch (err) {
        console.error("Post failed:", err);
        alert("Permission denied or error.");
    }
});