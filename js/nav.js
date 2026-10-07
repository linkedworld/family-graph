// 페이지 메뉴(브레드크럼 단추): 도구 막대 왼쪽의 <nav class="navmenu" data-page="…">를 채운다.
// 페이지를 옮겨도 같은 가계도·기준 인물을 이어서 보도록 주소의 #가계도 id를 그대로 넘기고,
// 기준 인물은 sessionStorage(이 탭 안에서만)로 주고받는다.
(function (G) {
  'use strict';

  const PAGES = [
    { id: 'tree', href: 'index.html', title: '가계도', desc: '카드로 보는 계보도 · 호칭과 촌수' },
    { id: 'bubble', href: 'bubble.html', title: '버블 가계도', desc: '3D 구슬로 보는 자손의 관계망' },
  ];
  const ROOT = '역사 인물 가계도';

  const egoKey = (ds) => `genealogy.ego.${ds}`;
  G.nav = {
    pages: PAGES,
    saveEgo(ds, id) { try { sessionStorage.setItem(egoKey(ds), id); } catch (e) { /* 저장 불가: 무시 */ } },
    loadEgo(ds) { try { return sessionStorage.getItem(egoKey(ds)); } catch (e) { return null; } },
  };

  function icon(paths) {
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 20 20');
    s.setAttribute('aria-hidden', 'true');
    for (const d of paths) {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      s.appendChild(p);
    }
    return s;
  }

  function build(nav) {
    const current = PAGES.find((p) => p.id === nav.dataset.page) || PAGES[0];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', `페이지 메뉴: ${ROOT} › ${current.title}`);
    btn.append(icon(['M3 5h14', 'M3 10h14', 'M3 15h14']));
    const crumb = document.createElement('span');
    crumb.className = 'crumb';
    crumb.innerHTML = `<span class="crumb-root"></span><span class="crumb-sep" aria-hidden="true">›</span><b></b>`;
    crumb.querySelector('.crumb-root').textContent = ROOT;
    crumb.querySelector('b').textContent = current.title;
    btn.append(crumb, icon(['M6 12l4-4 4 4']));

    const menu = document.createElement('ul');
    menu.className = 'nav-menu';
    menu.hidden = true;
    const links = PAGES.map((p) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = p.href;
      if (p === current) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<b></b><span></span>';
      a.querySelector('b').textContent = p.title;
      a.querySelector('span').textContent = p.desc;
      // 지금 보는 가계도를 이어서 연다.
      a.addEventListener('click', () => { a.href = p.href + location.hash; });
      li.append(a);
      menu.append(li);
      return a;
    });

    const open = (on) => {
      menu.hidden = !on;
      btn.setAttribute('aria-expanded', String(on));
      nav.classList.toggle('open', on);
      if (on) (links.find((a) => a.getAttribute('aria-current')) || links[0]).focus();
    };
    btn.addEventListener('click', (ev) => { ev.stopPropagation(); open(menu.hidden); });
    document.addEventListener('pointerdown', (ev) => { if (!nav.contains(ev.target)) open(false); });
    nav.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && !menu.hidden) { open(false); btn.focus(); }
      if ((ev.key === 'ArrowDown' || ev.key === 'ArrowUp') && !menu.hidden) {
        ev.preventDefault();
        const i = links.indexOf(document.activeElement);
        const n = links.length;
        links[(i + (ev.key === 'ArrowDown' ? 1 : n - 1)) % n].focus();
      }
    });
    nav.replaceChildren(btn, menu);
  }

  document.querySelectorAll('.navmenu').forEach(build);
})(globalThis.Genealogy = globalThis.Genealogy || {});
