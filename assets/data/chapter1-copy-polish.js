/* Chapter 01 film copy polish — 2026-08-24
 * Copy-only patch. Keeps durations, cue times, source cards, court-result summaries,
 * family/source-based statements, audio, visual tags and film production timing intact.
 */
(function () {
  "use strict";

  const productions = window.KAIKAI_FILM_PRODUCTIONS || {};
  const scenes = window.KAIKAI_SCENES || [];

  function cueAt(filmId, time) {
    return productions[filmId]?.cues?.find((item) => Math.abs(item.time - time) < 0.001);
  }

  function patchCue(filmId, time, patch) {
    const item = cueAt(filmId, time);
    if (!item) return;
    Object.assign(item, patch);
  }

  // FILM A｜土掩埋不住的清朝民間傳說
  // Tighten the folklore cadence and reduce repeated explanation.
  patchCue("FM-A", 0, { text: "天快亮了。把土壓平，把蓆角藏好。天一亮，院子還得像昨天一樣。" });
  patchCue("FM-A", 5.5, { text: "土能遮住人，遮得住她受過的苦嗎？" });
  patchCue("FM-A", 11, { text: "莫再說她的命。說得多了，倒像這屋裡真有人記得她。" });
  patchCue("FM-A", 17, { text: "土遮得住人的眼睛，遮不住一個孩子曾經來過。" });
  patchCue("FM-A", 29, { text: "你們埋下的，不只是一個不能說話的身影。還有一個本該被叫、被疼惜的名字。" });
  patchCue("FM-A", 48, { text: "風不會喊我的名字。門也不會記得，它曾把誰關在裡面。" });
  patchCue("FM-A", 62, { text: "我不是來討報應。我只想問：我哭的時候，你們可曾有一刻，把我當作一個人？" });
  patchCue("FM-A", 75.5, { text: "正因我再也長不大，這個問題才會比你們餘下的年月更長。" });
  patchCue("FM-A", 81, { text: "你們怕的不是鬼。你們怕天亮以後，還有人記得我活過。" });
  patchCue("FM-A", 104, { text: "從前，人們把答案交給鬼神；今天，終於能把刑責寫進判決。" });
  patchCue("FM-A", 111, { text: "判決能確定刑責，卻不能把孩子失去的明日送還。" });
  patchCue("FM-A", 118, { text: "所以，判決不該只是句點。" });
  patchCue("FM-A", 124, { text: "它也該是活著的大人，重新追問制度的起點。" });
  patchCue("FM-A", 149.5, { text: "相機記住判決落定的一刻；我們更該記得，孩子的危險從來不是那一天才開始。" });
  patchCue("FM-A", 153, { text: "傳說問因果；今天，我們問責任。" });

  // FILM D｜無法再相見▪︎天涯各自分
  // Remove the repeated paragraph in Act 3 and let trust/absence carry the scene.
  patchCue("FM-D", 0, { text: "有些探望不是沒有出發，只是始終沒有抵達。" });
  patchCue("FM-D", 8, { text: "她把思念收得很小。" });
  patchCue("FM-D", 24, { text: "怕一次探望驚擾照護，也怕見一次，就更捨不得一次。" });
  patchCue("FM-D", 43, { text: "於是她相信，會有人替她走近孩子。" });
  patchCue("FM-D", 52, { speaker: "女守門人｜文學化旁白", text: "她把想見孩子的那一步，交給了自己以為會走到的人。" });
  patchCue("FM-D", 82, { text: "交接、照護、訪視、紀錄、通報、接手——每一扇門，都有自己的職責。" });
  patchCue("FM-D", 91, { text: "但最後一扇門之後，誰回頭確認：孩子真的安全嗎？" });
  patchCue("FM-D", 99, { text: "她沒有放下孩子。她只是把探望，交給了信任。" });
  patchCue("FM-D", 107, { text: "信任原是交到制度手中的燈。它應照見門後的危險，不該在失去以後，變成壓回家屬肩上的重量。" });
  patchCue("FM-D", 128, { text: "她問的不是歲月為何無情。她問的是：在歲月還來得及的時候，看見、追問與保護，為何沒有抵達。" });
  patchCue("FM-D", 137, { text: "有些探望沒有抵達。但下一次，保護必須先抵達。" });

  // FILM B｜青絲變白髮
  // Keep source-based family lines untouched; make reconstructed hospital dialogue more restrained.
  patchCue("FM-B", 19, { text: "這麼小……怎麼會傷成這樣？" });
  patchCue("FM-B", 24, { text: "醫師說要通報。她一直說，已經有社工了。" });
  patchCue("FM-B", 29, { text: "孩子不會說，不代表身體與生活裡的異常不會說話。這些訊號不能只用一句話帶過。" });
  patchCue("FM-B", 33, { text: "這麼小……" });
  patchCue("FM-B", 41, { text: "她說……消息一直是透過社工知道的。" });
  patchCue("FM-B", 69.5, { text: "人離開以後，房間恢復原狀。失去孩子的人，不會。" });

  // FILM C｜兩個朝代▪︎不同世界▪︎同一扇門
  // Reframe the two children as symbolic sides of a visual dialogue rather than fabricated direct speech.
  const modern = "今朝一側｜象徵性旁白";
  const qing = "古厝一側｜象徵性旁白";
  patchCue("FM-C", 0, { speaker: modern, text: "妳那一邊，也曾有一扇沒有人替孩子打開的門嗎？" });
  patchCue("FM-C", 12, { speaker: qing, text: "有。我的年代，門閂比人聲更重。家門裡的事，要留在家門裡；孩子的哭聲再近，外人也常裝作沒聽見。" });
  patchCue("FM-C", 28, { speaker: modern, text: "這一側晚了百年。有電話、有社工、有醫院，訊息一瞬間就能走很遠。" });
  patchCue("FM-C", 38, { speaker: qing, text: "那麼多條路，應該很快就有人走到孩子身邊。" });
  patchCue("FM-C", 46, { speaker: modern, text: "但看見不等於相信，收到不等於追問。孩子仍可能被交給下一張表、下一通電話、下一個明天。" });
  patchCue("FM-C", 58, { speaker: qing, text: "我那時沒有制度，人們把公道寄託給鬼神。你們已有那麼多守護孩子的名字，為何門還會關上？" });
  patchCue("FM-C", 67, { speaker: modern, text: "也許不是沒有路，而是每個人都以為，下一個人會把路走完。" });
  patchCue("FM-C", 75, { speaker: qing, text: "世道進步了，律法更周全，照見苦難的燈也更多。可燈若只照紙上的字，黑暗仍會留在門後。" });
  patchCue("FM-C", 87, { speaker: modern, text: "孩子不必會說話，才能被聽見。退縮、消瘦、身體與生活裡的異常，都是需要被讀懂的訊號。" });
  patchCue("FM-C", 101, { speaker: qing, text: "百年以前，沉默穿著舊衣；百年以後，它只是換上了端正的表格。" });
  patchCue("FM-C", 112, { speaker: modern, text: "字比從前多了，孩子能等的時間，卻沒有變長。" });
  patchCue("FM-C", 120, { speaker: qing, text: "我從古厝走到這裡，不為索命，也不求報應。我只想問：下一個孩子沉默時，誰肯先把門打開？" });
  patchCue("FM-C", 132, { speaker: modern, text: "願下一個孩子不必成為傳說，不必等到判決才被所有人看見。願有人更早伸手。" });
  patchCue("FM-C", 142, { speaker: qing, text: "聽見以後，多問一句。" });
  patchCue("FM-C", 149, { speaker: modern, text: "懷疑以後，真正查證；危險逼近以前，依法啟動保護。" });
  patchCue("FM-C", 158, { speaker: qing, text: "願傳說不再需要用死亡提醒人間。" });
  patchCue("FM-C", 164, { speaker: modern, text: "願判決不再總是來到孩子已無法長大的那一天。" });
  patchCue("FM-C", 170, { speaker: "雙側旁白｜象徵性收束", text: "時代走得很遠，孩子的苦難不會自己消失。只有每一個看見的人，都肯把責任向前多送一步，明天才會不同。" });
  patchCue("FM-C", 190, { text: "記住他，不只是記住悲劇。願下一個孩子，在傷害發生以前，就有人伸手接住。" });

  // Keep scene cards, transcript drawers and cinema player on the same polished copy.
  scenes.forEach((scene) => {
    const production = productions[scene.id];
    if (!production) return;
    scene.production = production;
    scene.dialogue = production.cues.map((item) => ({
      speaker: item.speaker,
      text: item.text,
      id: item.id
    }));
  });
})();
