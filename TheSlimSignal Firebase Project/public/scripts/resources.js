// --- 1. FIRESTORE DATA HELPERS ---
import { auth, db } from './firebaseConfig.js';
import { getUserProfile } from './userProfiles.js';

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const categoryMap = {};

// -----------------------------
// PERMISSIONS (SAFE)
// -----------------------------
export async function getPermissions() {
    if (!auth.currentUser) {
        return { isStaff: false, isSuspended: false, isSilenced: false };
    }

    try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const data = userSnap.data() || {};

        return {
            isStaff: ['administrator', 'moderator'].includes(data.role),
            isSuspended: data.isSuspended === true,
            isSilenced: data.isSilenced === true
        };
    } catch {
        return { isStaff: false, isSuspended: false, isSilenced: false };
    }
}

// -----------------------------
// HELPERS
// -----------------------------
function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// -----------------------------
// CATEGORY LOADING (FIXED)
// -----------------------------
async function loadCategories() {
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

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

async function buildCategoryMap() {
    const categories = await loadCategories();

    categories.forEach(cat => {
        categoryMap[cat.id] = {
            name: cat.name,
            slug: cat.slug || slugify(cat.name || cat.id)
        };
    });
}

// -----------------------------
// UI: CATEGORY LIST
// -----------------------------
async function displayCategories() {
    const list = document.getElementById("category-list");
    if (!list) return;

    try {
        const categories = await loadCategories();
        list.innerHTML = "";

        categories.forEach(cat => {
            const card = document.createElement("div");
            card.classList.add("category-card");

            const hiddenBadge = cat.appearHidden
                ? " <small style='color:orange;'>[HIDDEN]</small>"
                : "";

            card.innerHTML = `
                <a class="category-link" href="/c/${cat.slug}" onclick="navigateToCategory('${cat.id}', '${cat.slug}'); return false;">
                    ${cat.name}${hiddenBadge}
                </a>
            `;

            list.appendChild(card);
        });

    } catch (e) {
        console.error("Error loading categories:", e);
        list.innerHTML = "<p>Access Denied or Error loading categories.</p>";
    }
}

// -----------------------------
// POSTS
// -----------------------------
export async function loadPosts(topicId) {
    const postsContainer = document.querySelector(".posts-container");
    if (!postsContainer) return;

    const { isStaff } = await getPermissions();

    let constraints = [where("topicId", "==", topicId)];

    if (!isStaff) {
        constraints.push(where("appearDeleted", "==", false));
    }

    constraints.push(orderBy("createdAt", "asc"));

    try {
        const snapshot = await getDocs(query(collection(db, "posts"), ...constraints));
        postsContainer.innerHTML = "";

        if (snapshot.empty) {
            postsContainer.innerHTML = "<p>No posts yet.</p>";
            return;
        }

        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const authorIds = [...new Set(posts.map(p => p.authorId).filter(Boolean))];
        const authorProfiles = {};

        await Promise.all(authorIds.map(async (id) => {
            const profile = await getUserProfile(id);
            if (profile) authorProfiles[id] = profile;
        }));

        posts.forEach(post => {
            const author = authorProfiles[post.authorId];
            const name = post.authorName || author?.displayName || author?.username || "Anonymous";

            const div = document.createElement("div");
            div.classList.add("post-card");

            const deletedBadge = (isStaff && post.appearDeleted)
                ? " <span style='color:red;'>[DELETED]</span>"
                : "";

            const date = post.createdAt?.toDate?.().toLocaleString() || "Unknown";

            div.innerHTML = `
                <div class="post-header">
                    <strong>${name}</strong>
                    <small>${date}${deletedBadge}</small>
                </div>
                <div class="post-content">${post.body}</div>
            `;

            postsContainer.appendChild(div);
        });

    } catch (e) {
        console.error("Post Load Error:", e);
        postsContainer.innerHTML = "<p>Error loading posts.</p>";
    }
}

// -----------------------------
// TOPICS
// -----------------------------
export async function loadTopics(categoryId) {
    const topicList = document.getElementById("topic-list");
    if (!topicList) return;

    topicList.innerHTML = "<p>Loading...</p>";

    if (Object.keys(categoryMap).length === 0) {
        await buildCategoryMap();
    }

    const { isStaff } = await getPermissions();

    let constraints = [where("categoryId", "==", categoryId)];

    if (!isStaff) {
        constraints.push(where("appearDeleted", "==", false));
    }

    constraints.push(orderBy("lastReplyAt", "desc"));

    try {
        const snapshot = await getDocs(query(collection(db, "topics"), ...constraints));
        topicList.innerHTML = "";

        const header = document.createElement("h2");
        header.textContent = categoryMap[categoryId]?.name || "Private Category";
        topicList.appendChild(header);

        if (snapshot.empty) {
            topicList.innerHTML += "<p>No topics yet.</p>";
            return;
        }

        snapshot.forEach(doc => {
            const topic = doc.data();

            const div = document.createElement("div");
            div.classList.add("topic-card");

            const deletedBadge = (isStaff && topic.appearDeleted)
                ? " <span style='color:red;'>[DELETED]</span>"
                : "";

            div.innerHTML = `
                <a href="/t/${doc.id}" onclick="navigateToTopic('${doc.id}'); return false;">
                    <h3>${topic.title}${deletedBadge}</h3>
                </a>
                <span>Replies: ${topic.replyCount || 0}</span>
            `;

            topicList.appendChild(div);
        });

    } catch (e) {
        console.error("Topic Load Error:", e);
        topicList.innerHTML = "<p>Access denied.</p>";
    }
}

// -----------------------------
// NAVIGATION
// -----------------------------
export function navigateToCategory(id, slug) {
    window.history.pushState({ categoryId: id }, "", `/c/${slug}`);
    loadTopics(id);
}

export function navigateToTopic(id) {
    window.history.pushState({ topicId: id }, "", `/t/${id}`);
    loadPosts(id);
}

window.navigateToCategory = navigateToCategory;
window.navigateToTopic = navigateToTopic;

// -----------------------------
// INIT
// -----------------------------
async function init() {
    await displayCategories();
    await buildCategoryMap();
}

init();