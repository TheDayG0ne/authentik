import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "dist");
const port = Number(process.env.TDGID_PREVIEW_PORT ?? 4173);
const mime = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
};

const previewIcon = (name) => {
    const paths = {
        home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
        apps: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
        users: '<circle cx="12" cy="8" r="3"/><path d="M5 20a7 7 0 0 1 14 0"/>',
        groups: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="11" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 17a5 5 0 0 1 6 3"/>',
        flows: '<path d="M5 5h5v5H5zM14 14h5v5h-5zM10 7h4M12 10v4"/>',
        events: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
        settings: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/><circle cx="12" cy="12" r="4"/>',
        website: '<path d="M4 5h16v14H4zM4 9h16M8 7h.01M11 7h.01"/>',
        phone: '<path d="M7 4h3l1 4-2 1a12 12 0 0 0 6 6l1-2 4 1v3c0 1-1 2-2 2C11 19 5 13 5 6c0-1 1-2 2-2z"/>',
        vmware: '<rect x="4" y="5" width="16" height="12" rx="2"/><path d="M8 20h8M12 17v3"/>',
        storage: '<path d="M5 5h14v5H5zM5 14h14v5H5zM8 8h.01M8 17h.01"/>',
        secure: '<path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v10H5z"/><circle cx="12" cy="15" r="1"/><path d="M12 16v2"/>',
    };
    return `<svg class="preview-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] ?? paths.apps}</svg>`;
};
const previewStyle = `<style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:"RedHatText",system-ui,sans-serif;background:#050408;color:#f8f4ff}body{background:radial-gradient(ellipse at 75% 0,#35134d 0,transparent 35%),#050408}.preview-shell{min-height:100vh;display:flex}.preview-side{width:280px;flex:0 0 280px;padding:24px 16px;background:linear-gradient(180deg,#171022f2,#09070df8);border-right:1px solid #b780e944;box-shadow:15px 0 45px #0006}.brand{display:flex;align-items:center;gap:12px;padding:10px 12px 28px;border-bottom:1px solid #b780e933;font-weight:800}.preview-icon{width:1.35em;height:1.35em;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;vertical-align:-.25em;transition:transform .24s cubic-bezier(.22,1,.36,1),filter .24s}.nav-icon{display:grid;place-items:center;width:22px;color:inherit}.nav-item:hover .preview-icon{transform:scale(1.12);filter:drop-shadow(0 0 8px #d3afff99)}.brand-mark{width:38px;height:38px;border:1px solid #d3afff;border-radius:13px;display:grid;place-items:center;color:#d3afff;background:#241333;font-family:monospace}.eyebrow{color:#b780e9;font:11px monospace;letter-spacing:.15em;text-transform:uppercase}.nav-group{margin:24px 8px 8px;color:#9e91ad;font:11px monospace;letter-spacing:.12em;text-transform:uppercase}.nav-item{display:flex;transition:transform .14s cubic-bezier(.22,1,.36,1),background .14s}.nav-item:hover{transform:translateX(4px);background:#b780e918}.nav-item{display:flex;gap:12px;align-items:center;padding:12px 14px;margin:4px 0;border-radius:12px;color:#c9bed5}.nav-item.active{color:#170b20;background:linear-gradient(100deg,#d3afff,#a96ce1);font-weight:800}.nav-item span:first-child{width:22px;color:inherit}.side-foot{position:fixed;bottom:20px;color:#8d819a;font-size:12px}.preview-main{flex:1;padding:clamp(24px,5vw,68px);min-width:0}.topline{display:flex;justify-content:space-between;align-items:center;margin-bottom:42px}.status{padding:7px 11px;border:1px solid #b780e944;border-radius:99px;color:#cdb5e7;font:11px monospace}.hero h1{font-size:clamp(32px,5vw,64px);line-height:.98;letter-spacing:-.06em;margin:8px 0 18px;max-width:720px}.hero p{color:#afa2b9;max-width:590px;font-size:17px;line-height:1.6}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin-top:38px}button.card{color:inherit;font:inherit;text-align:left;cursor:pointer}.card{padding:20px;transition:transform .24s cubic-bezier(.22,1,.36,1),border-color .24s,box-shadow .24s}.card:hover{transform:translateY(-5px);border-color:#d3afff88;box-shadow:0 18px 44px #0007}.card:active{transform:translateY(-2px) scale(.985)}.card{padding:20px;border-radius:20px;border:1px solid #b780e944;background:linear-gradient(145deg,#1b1226e8,#0c0911f7);min-height:150px;box-shadow:0 16px 35px #0005}.card:hover{transform:translateY(-3px);border-color:#d3afff}.icon{transition:transform .42s cubic-bezier(.16,1,.3,1),color .24s}.card:hover .icon{transform:rotate(-5deg) scale(1.12)}.icon{width:60px;height:60px;border-radius:17px;background:#100b16;border:1px solid #b780e966;display:grid;place-items:center;color:#d3afff;font-size:28px;margin-bottom:20px}.card h3{margin:0 0 6px}.card p{margin:0;color:#9e91ad;font-size:13px}.form-wrap{max-width:560px;margin:auto}.form-card{padding:clamp(26px,5vw,54px);border:1px solid #b780e955;border-radius:28px;background:linear-gradient(145deg,#20132ded,#0b0811fa 72%);box-shadow:0 28px 90px #0008}.form-card label{display:block;margin:20px 0 7px;color:#cdb5e7;font-size:13px}.form-card input{width:100%;height:50px;border:1px solid #b780e955;border-radius:10px;background:#09060d;color:#fff;padding:0 14px;font-size:16px}.button{display:inline-flex;border:0;border-radius:10px;padding:14px 20px;background:#d3afff;color:#180c24;font-weight:800;margin-top:24px}.mobile-only{display:none}@media(max-width:760px){.preview-side{width:76px;flex-basis:76px;padding:14px 8px}.brand strong,.nav-item:not(.active) span:last-child,.nav-group,.side-foot{display:none}.brand{padding:8px 0 20px;justify-content:center}.nav-item{justify-content:center}.preview-main{padding:24px 18px}.mobile-only{display:block}}
</style>`;

const adminPreview = (content) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TDG.id Admin preview</title>${previewStyle}</head><body><div class="preview-shell"><aside class="preview-side"><div class="brand"><div class="brand-mark">TDG</div><strong>TDG.id<br><span class="eyebrow">admin core</span></strong></div><div class="nav-group">Workspace</div><div class="nav-item active"><span class="nav-icon">${previewIcon("home")}</span><span>Обзор</span></div><div class="nav-item"><span class="nav-icon">${previewIcon("apps")}</span><span>Приложения</span></div><div class="nav-item"><span class="nav-icon">${previewIcon("users")}</span><span>Пользователи</span></div><div class="nav-item"><span class="nav-icon">${previewIcon("groups")}</span><span>Группы</span></div><div class="nav-group">Security</div><div class="nav-item"><span class="nav-icon">${previewIcon("flows")}</span><span>Потоки и MFA</span></div><div class="nav-item"><span class="nav-icon">${previewIcon("events")}</span><span>События</span></div><div class="nav-item"><span class="nav-icon">${previewIcon("settings")}</span><span>Настройки</span></div><div class="side-foot">TDG.id 2026.8.5<br>private preview</div></aside><main class="preview-main">${content}</main></div></body></html>`;

const previewScript = `<script>document.addEventListener("click",(event)=>{const item=event.target.closest("[data-preview-action]");if(!item)return;event.preventDefault();const notice=document.querySelector("#preview-notice");if(notice){notice.textContent=item.dataset.previewAction;notice.hidden=false;setTimeout(()=>notice.hidden=true,2600)}})</script>`;

const userPreview = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TDG.id Library preview</title>${previewStyle}</head><body><main class="preview-main"><div class="topline"><div class="brand"><div class="brand-mark">TDG</div><strong>TDG.id</strong></div><span class="status">DEMO SESSION / e.struchkov</span></div><section class="hero"><div class="eyebrow">application library</div><h1>Ваши сервисы<br>в одном пространстве.</h1><p>Быстрый доступ к инфраструктуре TheDayG0ne. Это локальный дизайн-просмотр TDG.id без подключения к рабочей базе.</p></section><div class="grid"><button class="card" data-preview-action="В preview запуск приложений отключён."><div class="icon">${previewIcon("website")}</div><h3>TheDayG0ne Website</h3><p>Сайты и веб-сервисы</p></button><button class="card" data-preview-action="В preview запуск приложений отключён."><div class="icon">${previewIcon("phone")}</div><h3>FreePBX</h3><p>Телефония</p></button><button class="card" data-preview-action="В preview запуск приложений отключён."><div class="icon">${previewIcon("vmware")}</div><h3>VMware vSphere</h3><p>Виртуализация</p></button><button class="card" data-preview-action="В preview запуск приложений отключён."><div class="icon">${previewIcon("storage")}</div><h3>Synology DSM</h3><p>Файлы и хранилища</p></button></div><p id="preview-notice" class="status" hidden aria-live="polite" style="position:fixed;right:22px;bottom:22px"></p></main>${previewScript}</body></html>`;

const flowPreview = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TDG.id Secure access preview</title>${previewStyle}</head><body><main class="preview-main"><div class="topline"><div class="eyebrow">TDG.id / secure access</div><span class="status">RU · FLOW DEMO</span></div><div class="form-wrap"><section class="form-card"><div class="security-mark">${previewIcon("secure")}</div><div class="eyebrow">identity gateway</div><h1>Добро пожаловать.</h1><p style="color:#afa2b9">Войдите в защищённое пространство TDG.id</p><label>Имя пользователя</label><input placeholder="Введите имя пользователя"><label>Пароль</label><input type="password" placeholder="Введите пароль"><button class="button" data-preview-action="Это демонстрационная форма. Реальный вход доступен только после запуска изолированного staging-backend.">Продолжить →</button></section></div><p id="preview-notice" class="status" hidden aria-live="polite" style="position:fixed;right:22px;bottom:22px;max-width:380px"></p></main>${previewScript}</body></html>`;

const shells = {
    admin: adminPreview(`<div class="topline"><div><div class="eyebrow">TDG.id control plane</div><h1 style="margin:8px 0 0">Система под контролем.</h1></div><span class="status">LOCAL DESIGN PREVIEW</span></div><section class="hero"><p>Управляйте доступом, приложениями и политиками в едином интерфейсе. Админская навигация находится только слева.</p></section><div class="grid"><div class="card"><div class="icon">${previewIcon("apps")}</div><h3>Приложения</h3><p>5 подключённых сервисов</p></div><div class="card"><div class="icon">${previewIcon("users")}</div><h3>Пользователи</h3><p>Управление учётными записями</p></div><div class="card"><div class="icon">${previewIcon("events")}</div><h3>События</h3><p>Аудит и безопасность</p></div></div>`),
    user: userPreview,
    flow: flowPreview,
};

const server = createServer(async (request, response) => {
    const requested = decodeURIComponent((request.url ?? "/").split("?")[0]);

    if (requested === "/if/admin/" || requested === "/if/admin") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(shells.admin);
        return;
    }
    if (requested === "/if/user/" || requested === "/if/user") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(shells.user);
        return;
    }
    if (requested.startsWith("/if/flow/")) {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        response.end(shells.flow);
        return;
    }

    const candidate = path.resolve(root, `.${requested}`);
    if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) {
        response.writeHead(403).end("Forbidden");
        return;
    }

    let file = candidate;
    try {
        const info = await stat(file);
        if (info.isDirectory()) file = path.join(file, "index.html");
        await stat(file);
    } catch {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("TDG.id preview: choose /if/admin/, /if/user/ or /if/flow/preview/");
        return;
    }

    try {
        response.writeHead(200, {
            "Cache-Control": "no-store",
            "Content-Type": mime[path.extname(file)] ?? "application/octet-stream",
        });
        createReadStream(file).pipe(response);
    } catch {
        response.writeHead(404).end("Not found");
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`TDG.id preview: http://127.0.0.1:${port}`);
    console.log(`Serving: ${root}`);
});
