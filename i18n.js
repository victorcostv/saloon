// ════════════════════════════════════════════
// SALOON — i18n (PT padrão; EN, ES, FR e DE no menu lateral)
// ════════════════════════════════════════════

// Ordem da lista no botão "Idioma" do menu. html = atributo lang da página.
// As bandeiras são SVG: o emoji de bandeira vira duas letras no Windows.
const _bandeira = (desenho) => '<svg class="bandeira" viewBox="0 0 30 20" aria-hidden="true">' + desenho + '</svg>';
const IDIOMAS = {
    pt: { nome: 'Português', html: 'pt-BR', bandeira: _bandeira(
        '<rect width="30" height="20" fill="#229e45"/><path d="M15 2.4 27.2 10 15 17.6 2.8 10z" fill="#f8d90f"/>'
        + '<circle cx="15" cy="10" r="4.7" fill="#2b49a3"/><path d="M10.5 9c3-.8 6.4-.3 9 1.4" fill="none" stroke="#fff" stroke-width="1.1"/>') },
    en: { nome: 'English', html: 'en', bandeira: _bandeira(
        '<rect width="30" height="20" fill="#fff"/>'
        + '<path d="M0 0h30v2.86H0zM0 5.71h30v2.86H0zM0 11.43h30v2.86H0zM0 17.14h30V20H0z" fill="#c8102e"/>'
        + '<rect width="13" height="11.43" fill="#1f3a8a"/>'
        + '<g fill="#fff"><circle cx="2.6" cy="2.4" r=".9"/><circle cx="6.5" cy="2.4" r=".9"/><circle cx="10.4" cy="2.4" r=".9"/>'
        + '<circle cx="4.55" cy="5.7" r=".9"/><circle cx="8.45" cy="5.7" r=".9"/>'
        + '<circle cx="2.6" cy="9" r=".9"/><circle cx="6.5" cy="9" r=".9"/><circle cx="10.4" cy="9" r=".9"/></g>') },
    es: { nome: 'Español', html: 'es', bandeira: _bandeira(
        '<rect width="30" height="20" fill="#c60b1e"/><rect y="5" width="30" height="10" fill="#ffc400"/>') },
    fr: { nome: 'Français', html: 'fr', bandeira: _bandeira(
        '<rect width="30" height="20" fill="#fff"/><rect width="10" height="20" fill="#0055a4"/><rect x="20" width="10" height="20" fill="#ef4135"/>') },
    de: { nome: 'Deutsch', html: 'de', bandeira: _bandeira(
        '<rect width="30" height="20" fill="#ffce00"/><rect width="30" height="13.34" fill="#dd0000"/><rect width="30" height="6.67" fill="#000"/>') }
};

const I18N = {
    pt: {
        // ---- Splash / home ----
        tap_start: 'Toque para entrar no saloon',

        // ---- Setup ----
        setup_title: 'Anote os jogadores<br>na ordem em que estão sentados:',
        name_ph: 'Nome do jogador',
        next: 'Próximo',
        how_to_play: 'Como jogar',
        back: 'Voltar',
        extras_title: 'Personagens extras',
        extra_roles: 'Distintivo',
        extra_roles_sub: 'Delegado e Chefe da Gangue',
        extra_revolver: 'Duelo',
        extra_revolver_sub: 'Revólver carregado',
        extra_farsante: 'Farsante',
        extra_farsante_sub: 'Escrivão e Falsificador',
        farsante_req: 'Requer Distintivo',
        confirm: 'Abrir a mesa!',
        min_players: 'Mínimo de 5 jogadores para iniciar.',
        max_players: 'Máximo de 10 jogadores alcançado.',
        name_exists: 'Nome já existe.',
        close: 'Fechar',
        leave_game_title: 'Sair da partida?',
        leave_game_text: 'A partida em andamento será perdida.',
        leave_game_yes: 'Sair',
        leave_game_no: 'Continuar',
        remove_player: 'Remover jogador',
        scroll_more: 'Deslize para ver mais',

        // ---- Passe o celular / confirmação ----
        pass_to: 'Passe o celular para',
        confidential_to: 'Revelação confidencial para',
        no_peeking: 'Certifique-se de que ninguém mais está olhando.',
        im_name: 'Eu sou {name}',

        // ---- Revelação de carta ----
        your_identity: 'Sua identidade',
        reveal_card: 'Revelar carta',
        flip_card: 'Virar a carta',
        hide_card: 'Esconder e passar adiante',
        others_outlaws: 'Outros Fora da Lei',
        has_revolver: 'VOCÊ POSSUI O REVÓLVER',
        boss_tagged: '(Chefe)',
        delegate_notice: '<span class="delegate-target">{name}</span> é um fora da lei,<br>mas não deixe claro que você sabe disso...',

        // ---- Papéis ----
        role_law: 'Equipe da Lei',
        role_delegado: 'Delegado',
        role_outlaw: 'Fora da Lei',
        role_boss: 'Chefe da Gangue',
        role_escrivao: 'Escrivão',
        role_falsificador: 'Falsificador',
        escrivao_desc1: 'Um destes é o Delegado de verdade. O outro é um impostor. Descubra em quem confiar.',
        escrivao_title: 'Delegado ou Falsificador?',
        falsificador_desc2: 'Mas finge ser a autoridade.',
        falsificador_notice: 'Você aparece como possível <b>Delegado</b> para o Escrivão. No duelo, parece ser da <b>Lei</b>.',
        law_desc1: 'Ajude o Xerife nas missões e descubra quem são os fora da lei.',
        law_desc2: 'Você deve cumprir todas as missões em que estiver.',
        outlaw_desc1: 'Você está infiltrado na cidade.',
        outlaw_desc2: 'Sabote (ou não) as missões sem ser percebido.',
        boss_desc2: 'Sabote (ou não) as missões sem ser percebido e descubra o delegado.',

        // ---- Tabuleiro ----
        rejected_teams: 'Equipes rejeitadas:',
        current_sheriff: 'Xerife da rodada:',
        sheriff_must: 'O xerife precisa montar uma equipe de <strong id="mission-size-req" class="neon-text">X</strong> jogadores para a Missão <span id="current-mission-num">1</span>.',
        select_team: 'Selecione a equipe:',
        propose_team: 'Propor equipe',
        two_fails: '2 sabotagens',

        // ---- Votação (offline) ----
        team_vote_title: 'Votação da equipe',
        proposed_by: 'Equipe proposta por',
        voting_rules: '<p><strong>A votação é feita em grupo, agora!</strong> Todos votam ao mesmo tempo de olhos fechados (polegar para cima = aprovar, para baixo = rejeitar).</p><p>Para a missão sair, são necessários pelo menos <strong id="majority-number" class="destaque">X</strong> votos de aprovação.</p>',
        vote_yes_group: 'Maioria APROVOU',
        vote_no_group: 'Maioria REJEITOU',

        // ---- Missão ----
        mission_exec: 'Executar missão',
        chip_cumprir: 'Cumprir',
        chip_sabotar: 'Sabotar',
        law_only: 'Membros da Lei SÓ PODEM cumprir.',
        mission_result_title: 'Resultado da missão',
        mission_chips_sub: 'Uma ficha por membro da equipe:',
        sabotages: 'Sabotagens:',
        next_phase: 'Próxima fase',
        mission_success_t: 'Missão bem-sucedida!',
        mission_fail_t: 'Missão sabotada!',
        mission_success_lore: 'A operação em Red Rock foi concluída.',
        needed_two_fails: 'Houve 1 sabotagem, mas esta missão só falhava com 2.',
        mission_fail_lore: 'Havia infiltrados na equipe e a operação falhou!',

        // ---- Duelo ----
        duel_time: 'Hora do duelo',
        duel_owner_has: '{name} possui o revólver.',
        duel_choose: 'Escolha alguém para duelar:',
        challenge: 'Desafiar',
        skip_duel: 'Pular duelo',
        duel_hold: 'Mantenha-se firme. Como você reage neste duelo?',
        shoot: 'ATIRAR',
        lower_gun: 'ABAIXAR A ARMA',
        dust_settling: 'A poeira está baixando...',
        duel_gaze: 'Duelo de olhares',
        duel_decided: 'Os dois jogadores já tomaram suas decisões no duelo de olhares.',
        see_duel_result: 'Ver resultado do duelo',
        mission_ready: 'A equipe já decidiu',
        mission_n: 'Missão {n}',
        mission_ready_note: 'Coloque o celular no meio da mesa, onde todos possam ver.',
        see_result: 'Ver resultado',
        duel_result_title: 'Resultado do duelo',
        continue_game: 'Continuar o jogo',
        duel_both_shot: 'Ambos atiraram!<br>Por sorte, erraram os tiros.',
        duel_both_down: 'Ambos abaixaram as armas.<br>Clima de paz.',
        duel_mixed: 'Uma pessoa atirou e a outra abaixou a arma.<br>Um dos dois foi traiçoeiro.',
        intimidation_title: 'Intimidação bem-sucedida',
        belongs_team: 'O jogador <strong id="intimidated-name">NOME</strong> pertence ao time:',
        understood_hide: 'Entendi, esconder',
        duel_started_you: 'Você iniciou o duelo',
        duel_challenged: 'Você foi desafiado!',
        law_resistance: 'EQUIPE DA LEI',
        outlaw_team: 'FORA DA LEI',

        // ---- Chefe / assassinato ----
        boss_last_chance: 'Última chance do Chefe',
        boss_text: 'A Lei cumpriu 3 missões, mas o Chefe da Gangue ainda tem uma última bala. Chefe, pegue o celular e tente acertar quem é o Delegado.',
        assassinate: 'Assassinar',

        // ---- Fim de jogo ----
        game_over: 'Fim de jogo',
        team_law: 'Equipe da Lei',
        team_outlaws: 'Fora da Lei',
        play_again: 'Jogar novamente',
        traitor: 'Traíra',
        tag_boss: ' (CHEFE)',
        tag_delegado: ' (DELEGADO)',
        tag_escrivao: ' (ESCRIVÃO)',
        tag_falsificador: ' (FALSIFICADOR)',
        win_outlaw_rejects: 'Vitória dos Fora da Lei! 5 equipes seguidas foram rejeitadas pela cidade.',
        win_law_missions: 'Vitória da Lei! A cidade de Red Rock foi salva.',
        win_outlaw_missions: 'Vitória dos Fora da Lei! Red Rock sucumbiu.',
        win_boss_shot: 'BANG! O Chefe da Gangue assassinou o Delegado antes de fugir! Vitória dos Fora da Lei!',
        win_boss_missed: 'O Chefe atirou na pessoa errada. A cidade executou todos eles! Vitória incontestável da Lei!',

        // ---- Sigilo da ficha ----
        secret_choice: 'Sua escolha é SECRETA. Ninguém verá sua decisão.',
        choice_registered_short: 'Escolha registrada!',
        pass_phone: 'Passar o celular',

        // ---- Menu lateral ----
        menu: 'Saloon',
        sound_on: 'Som ativado',
        sound_off: 'Som desativado',
        more_info: 'Saiba mais',
        language: 'Idioma',
        home_screen: 'Tela inicial',
        cancel: 'Cancelar',
        feedback: 'Enviar feedback',
        feedback_title: 'Seu feedback',
        feedback_text: 'Tem uma ideia, achou um problema ou quer elogiar? Escreva aqui que a mensagem chega direto para nós.',
        feedback_ph: 'Escreva sua mensagem...',
        feedback_send: 'Enviar',
        feedback_or: 'Ou escreva para',
        feedback_subject: 'Feedback do Saloon',

        // ---- Tutoriais ----
        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Quem é o verdadeiro informante da Lei? Dois novos personagens entram, e um deles é pura fachada.</p>
                <div class="card">
                    <h2>Os dois novos papéis</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Escrivão</span><span class="meta">Da Lei. Vê dois nomes, mas não sabe qual é o Delegado.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Falsificador</span><span class="meta">Fora da lei. Finge ser a autoridade.</span></div></div>
                    <p>Esta expansão <strong>exige o Delegado e o Chefe</strong> (Distintivo).</p>
                </div>
                <div class="card">
                    <h2>O dilema do Escrivão</h2>
                    <p>O Escrivão vê <strong>dois nomes</strong>: um é o <strong>Delegado</strong> verdadeiro, o outro é o <strong>Falsificador</strong> disfarçado. Mas <strong>não sabe qual é qual</strong> e precisa deduzir em quem confiar.</p>
                </div>
                <div class="card">
                    <h2>O disfarce do Falsificador</h2>
                    <p>É um <strong>fora da lei comum</strong>: conhece os outros bandidos e <strong>pode sabotar</strong>. O <strong>Delegado não o enxerga</strong>, então ele blefa livremente. No <strong>duelo</strong>, aparece como time da <strong>Lei</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>Com a Farsante ativa, o Delegado passa a <strong>ver o Chefe</strong>, e quem some da visão dele é o <strong>Falsificador</strong>. Os dois são sempre pessoas diferentes.</span></div>
                </div>`,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> é um jogo de dedução social para 5 a 10 jogadores. Confie em quem merece.</p>
                <div class="card">
                    <h2>Dois times, uma cidade</h2>
                    <p>No início, cada jogador recebe uma carta <strong>secreta</strong> que define seu time. Ninguém mais pode vê-la.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">Equipe da Lei</span><span class="meta">A maioria. Não sabe quem é quem.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Fora da Lei</span><span class="meta">A minoria infiltrada. Eles se conhecem entre si.</span></div></div>
                    <p>A Lei vence cumprindo missões. Os Fora da Lei vencem sabotando sem serem descobertos.</p>
                </div>
                <div class="card">
                    <h2>Objetivo: 3 fichas</h2>
                    <p>A partida tem até <strong>5 missões</strong>. Quem cravar <strong>3 fichas</strong> primeiro, vence.</p>
                    <div class="chips-row" data-fichas="lei:2 lei:3 fora:2 3! 3"></div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>missão cumprida</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>missão sabotada</i>
                    </div>
                    <p style="margin-top:10px">O número na ficha indica quantos jogadores vão para aquela missão.</p>
                </div>
                <div class="card">
                    <h2>A rodada, passo a passo</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>O Xerife monta a equipe</h3><p>Um jogador é o <strong>Xerife</strong> da rodada. Ele escolhe quem vai para a missão (o número na ficha). O cargo gira a cada rodada.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Todos votam na equipe</h3><p><strong>Todo mundo</strong> vota sim ou não — inclusive quem ficou de fora. Maioria simples aprova e a missão começa.</p><p>Rejeitou? O Xerife passa para o próximo jogador, que propõe outra equipe.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>A missão é secreta</h3><p>Cada escolhido decide no celular, escondido: <strong>cumprir</strong> ou <strong>sabotar</strong>.</p><p>Quem é da Lei <strong>só pode cumprir</strong>. O Fora da Lei escolhe — sabotar avança o time dele, mas levanta suspeita.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>O resultado vira ficha</h3><p>Os votos da missão são revelados juntos, sem dizer de quem foram. <strong>Uma única sabotagem</strong> já derruba a missão — e a ficha fica vermelha.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 equipes rejeitadas em sequência</strong> = a cidade entrou em colapso. Vitória imediata dos Fora da Lei. Não deixem a votação travar!</span></div>
                    <div class="nota">Em mesas grandes, algumas missões exigem <strong>2 sabotagens</strong> para falhar — a ficha avisa com "2 sabotagens".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Delegado e Chefe</h2>
                    <p>Dois personagens especiais entram no baralho — um para cada time.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Delegado</span><span class="meta">Da Lei. Começa sabendo quem é Fora da Lei.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Chefe da Gangue</span><span class="meta">O único bandido que o Delegado NÃO conhece.</span></div></div>
                    <p>O Delegado precisa usar o que sabe com <strong>cautela</strong>: se agir na cara, vira alvo.</p>
                    <div class="alerta"><span class="bang">!</span><span>Se a Lei vencer as 3 missões, o Chefe tem <strong>uma última bala</strong>: tentar adivinhar quem é o Delegado. Se acertar, os Fora da Lei <strong>roubam a vitória</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><img class="tut-h2-img" src="images/revolver.png" alt=""> Revólver e duelo</h2>
                    <p>Um jogador começa com o <strong>revólver</strong>. Após as missões 2 e 3, ele pode desafiar alguém para um <strong>duelo de olhares</strong> (ou pular).</p>
                    <p>No duelo, os dois escolhem em segredo: <strong>atirar</strong> ou <strong>abaixar a arma</strong>.</p>
                    <div class="nota">Se os dois escolherem o <strong>mesmo</strong>, o dono do revólver descobre o <strong>time</strong> do oponente — em sigilo. Se escolherem diferente, só a tensão fica no ar.</div>
                    <p style="margin-top:10px">Depois do duelo, o revólver passa para o desafiado (sem devolução imediata).</p>
                </div>`
        }
    },

    en: {
        tap_start: 'Tap to enter the saloon',

        setup_title: 'Write down the players<br>in seating order:',
        name_ph: 'Player name',
        next: 'Next',
        how_to_play: 'How to play',
        back: 'Back',
        extras_title: 'Extra characters',
        extra_roles: 'Badge',
        extra_roles_sub: 'Marshal and Gang Boss',
        extra_revolver: 'Duel',
        extra_revolver_sub: 'Loaded revolver',
        extra_farsante: 'Farce',
        extra_farsante_sub: 'Clerk and Forger',
        farsante_req: 'Requires Badge',
        confirm: 'Open the table!',
        min_players: 'At least 5 players are needed to start.',
        max_players: 'Maximum of 10 players reached.',
        name_exists: 'Name already exists.',
        close: 'Close',
        leave_game_title: 'Leave the game?',
        leave_game_text: 'The game in progress will be lost.',
        leave_game_yes: 'Leave',
        leave_game_no: 'Keep playing',
        remove_player: 'Remove player',
        scroll_more: 'Swipe for more',

        pass_to: 'Pass the phone to',
        confidential_to: 'Confidential reveal for',
        no_peeking: 'Make sure nobody else is watching.',
        im_name: "I'm {name}",

        your_identity: 'Your identity',
        reveal_card: 'Reveal card',
        flip_card: 'Flip the card',
        hide_card: 'Hide it and pass along',
        others_outlaws: 'Fellow Outlaws',
        has_revolver: 'YOU HOLD THE REVOLVER',
        boss_tagged: '(Boss)',
        delegate_notice: '<span class="delegate-target">{name}</span> is an outlaw,<br>but don\'t make it obvious that you know...',

        role_law: 'The Law',
        role_delegado: 'Marshal',
        role_outlaw: 'Outlaw',
        role_boss: 'Gang Boss',
        role_escrivao: 'Clerk',
        role_falsificador: 'Forger',
        escrivao_desc1: 'One of these is the real Marshal. The other is an impostor. Figure out who to trust.',
        escrivao_title: 'Marshal or Forger?',
        falsificador_desc2: 'But you pose as the authority.',
        falsificador_notice: 'You appear as a possible <b>Marshal</b> to the Clerk. In the duel, you look like the <b>Law</b>.',
        law_desc1: 'Help the Sheriff on missions and find out who the outlaws are.',
        law_desc2: 'You must complete every mission you join.',
        outlaw_desc1: 'You are undercover in town.',
        outlaw_desc2: 'Sabotage (or not) the missions without being noticed.',
        boss_desc2: 'Sabotage (or not) the missions without being noticed, and find the marshal.',

        rejected_teams: 'Rejected teams:',
        current_sheriff: 'Sheriff this round:',
        sheriff_must: 'The sheriff must build a team of <strong id="mission-size-req" class="neon-text">X</strong> players for Mission <span id="current-mission-num">1</span>.',
        select_team: 'Select the team:',
        propose_team: 'Propose team',
        two_fails: '2 sabotages',

        team_vote_title: 'Team vote',
        proposed_by: 'Team proposed by',
        voting_rules: '<p><strong>The vote happens as a group, right now!</strong> Everyone votes at once with eyes closed (thumbs up = approve, thumbs down = reject).</p><p>The mission needs at least <strong id="majority-number" class="destaque">X</strong> approval votes to go ahead.</p>',
        vote_yes_group: 'Majority APPROVED',
        vote_no_group: 'Majority REJECTED',

        mission_exec: 'Run the mission',
        chip_cumprir: 'Complete',
        chip_sabotar: 'Sabotage',
        law_only: 'Law members can ONLY complete.',
        mission_result_title: 'Mission outcome',
        mission_chips_sub: 'One chip per team member:',
        sabotages: 'Sabotages:',
        next_phase: 'Next phase',
        mission_success_t: 'Mission accomplished!',
        mission_fail_t: 'Mission sabotaged!',
        mission_success_lore: 'The Red Rock operation was a success.',
        needed_two_fails: 'There was 1 sabotage, but this mission needed 2 to fail.',
        mission_fail_lore: 'There were infiltrators on the team and the operation failed!',

        duel_time: 'Time to duel',
        duel_owner_has: '{name} holds the revolver.',
        duel_choose: 'Choose someone to duel:',
        challenge: 'Challenge',
        skip_duel: 'Skip the duel',
        duel_hold: 'Stand your ground. How do you react in this duel?',
        shoot: 'SHOOT',
        lower_gun: 'LOWER YOUR GUN',
        dust_settling: 'The dust is settling...',
        duel_gaze: 'Staredown duel',
        duel_decided: 'Both players have made their choices in the staredown.',
        see_duel_result: 'See the duel outcome',
        mission_ready: 'The team has decided',
        mission_n: 'Mission {n}',
        mission_ready_note: 'Put the phone in the middle of the table where everyone can see.',
        see_result: 'See the result',
        duel_result_title: 'Duel outcome',
        continue_game: 'Continue the game',
        duel_both_shot: 'Both fired!<br>Luckily, both missed.',
        duel_both_down: 'Both lowered their guns.<br>Peace, for now.',
        duel_mixed: 'One fired and the other lowered their gun.<br>One of them played dirty.',
        intimidation_title: 'Successful intimidation',
        belongs_team: 'Player <strong id="intimidated-name">NAME</strong> belongs to:',
        understood_hide: 'Got it, hide',
        duel_started_you: 'You started the duel',
        duel_challenged: 'You were challenged!',
        law_resistance: 'THE LAW',
        outlaw_team: 'OUTLAW',

        boss_last_chance: "The Boss's last chance",
        boss_text: 'The Law completed 3 missions, but the Gang Boss still has one last bullet. Boss, take the phone and try to hit the Marshal.',
        assassinate: 'Assassinate',

        game_over: 'Game over',
        team_law: 'The Law',
        team_outlaws: 'Outlaws',
        play_again: 'Play again',
        traitor: 'Traitor',
        tag_boss: ' (BOSS)',
        tag_delegado: ' (MARSHAL)',
        tag_escrivao: ' (CLERK)',
        tag_falsificador: ' (FORGER)',
        win_outlaw_rejects: 'Outlaws win! The town rejected 5 teams in a row.',
        win_law_missions: 'The Law wins! The town of Red Rock is safe.',
        win_outlaw_missions: 'Outlaws win! Red Rock has fallen.',
        win_boss_shot: 'BANG! The Gang Boss shot the Marshal before fleeing! Outlaws win!',
        win_boss_missed: 'The Boss shot the wrong person. The town executed them all! Undisputed victory for the Law!',

        secret_choice: 'Your choice is SECRET. Nobody will see your decision.',
        choice_registered_short: 'Choice registered!',
        pass_phone: 'Pass the phone',

        menu: 'Saloon',
        sound_on: 'Sound on',
        sound_off: 'Sound off',
        more_info: 'Learn more',
        language: 'Language',
        home_screen: 'Home screen',
        cancel: 'Cancel',
        feedback: 'Send feedback',
        feedback_title: 'Your feedback',
        feedback_text: 'An idea, a problem or some praise? Write it here and it goes straight to our email.',
        feedback_ph: 'Write your message...',
        feedback_send: 'Send',
        feedback_or: 'Or email',
        feedback_subject: 'Saloon feedback',

        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Who is the Law real informant? Two new characters join, and one is pure facade.</p>
                <div class="card">
                    <h2>The two new roles</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Clerk</span><span class="meta">Law side. Sees two names, unsure which is the Marshal.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Forger</span><span class="meta">Outlaw. Poses as the authority.</span></div></div>
                    <p>This expansion <strong>requires the Marshal and Boss</strong> (Badge).</p>
                </div>
                <div class="card">
                    <h2>The Clerk dilemma</h2>
                    <p>The Clerk sees <strong>two names</strong>: one is the real <strong>Marshal</strong>, the other is the disguised <strong>Forger</strong>. But does <strong>not know which is which</strong> and must deduce who to trust.</p>
                </div>
                <div class="card">
                    <h2>The Forger disguise</h2>
                    <p>A <strong>common outlaw</strong>: knows the other bandits and <strong>can sabotage</strong>. The <strong>Marshal cannot see him</strong>, so he bluffs freely. In the <strong>duel</strong>, he appears as the <strong>Law</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>With Farce active, the Marshal now <strong>sees the Boss</strong>, and the one hidden from him becomes the <strong>Forger</strong>. They are always different people.</span></div>
                </div>`,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> is a social deduction game for 5 to 10 players. Trust the right people.</p>
                <div class="card">
                    <h2>Two teams, one town</h2>
                    <p>At the start, every player gets a <strong>secret</strong> card that sets their team. Nobody else may see it.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">The Law</span><span class="meta">The majority. They don't know who's who.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Outlaws</span><span class="meta">The hidden minority. They know each other.</span></div></div>
                    <p>The Law wins by completing missions. The Outlaws win by sabotaging without getting caught.</p>
                </div>
                <div class="card">
                    <h2>Goal: 3 chips</h2>
                    <p>A match has up to <strong>5 missions</strong>. First side to claim <strong>3 chips</strong> wins.</p>
                    <div class="chips-row" data-fichas="lei:2 lei:3 fora:2 3! 3"></div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>mission completed</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>mission sabotaged</i>
                    </div>
                    <p style="margin-top:10px">The number on the chip shows how many players go on that mission.</p>
                </div>
                <div class="card">
                    <h2>The round, step by step</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>The Sheriff picks a team</h3><p>One player is the round's <strong>Sheriff</strong>. They choose who goes on the mission (the number on the chip). The badge rotates every round.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Everyone votes on the team</h3><p><strong>Everyone</strong> votes yes or no — including players left out. A simple majority approves and the mission starts.</p><p>Rejected? The badge passes to the next player, who proposes another team.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>The mission is secret</h3><p>Each chosen player decides on the phone, hidden: <strong>complete</strong> or <strong>sabotage</strong>.</p><p>Law members <strong>can only complete</strong>. Outlaws choose — sabotaging helps their side, but raises suspicion.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>The result claims a chip</h3><p>The mission votes are revealed together, without naming anyone. <strong>A single sabotage</strong> fails the mission — and the chip turns red.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 rejected teams in a row</strong> = the town collapses. Instant Outlaw victory. Don't let the vote stall!</span></div>
                    <div class="nota">On bigger tables, some missions need <strong>2 sabotages</strong> to fail — the chip is marked "2 sabotages".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Marshal and Boss</h2>
                    <p>Two special characters join the deck — one for each team.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Marshal</span><span class="meta">On the Law. Starts knowing who the Outlaws are.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Gang Boss</span><span class="meta">The only outlaw the Marshal does NOT know.</span></div></div>
                    <p>The Marshal must use that knowledge with <strong>care</strong>: act too openly and they become a target.</p>
                    <div class="alerta"><span class="bang">!</span><span>If the Law wins 3 missions, the Boss gets <strong>one last bullet</strong>: guess who the Marshal is. A hit means the Outlaws <strong>steal the victory</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><img class="tut-h2-img" src="images/revolver.png" alt=""> Revolver and duel</h2>
                    <p>One player starts with the <strong>revolver</strong>. After missions 2 and 3, they may challenge someone to a <strong>staring duel</strong> (or skip).</p>
                    <p>In the duel, both secretly choose: <strong>shoot</strong> or <strong>lower your gun</strong>.</p>
                    <div class="nota">If both pick the <strong>same</strong>, the revolver owner learns the opponent's <strong>team</strong> — in secret. If they differ, only the tension lingers.</div>
                    <p style="margin-top:10px">After the duel, the revolver passes to the challenged player (no immediate return).</p>
                </div>`
        }
    },

    es: {
        tap_start: 'Toca para entrar al saloon',

        setup_title: 'Anota a los jugadores<br>en el orden en que están sentados:',
        name_ph: 'Nombre del jugador',
        next: 'Siguiente',
        how_to_play: 'Cómo jugar',
        back: 'Volver',
        extras_title: 'Personajes extra',
        extra_roles: 'Placa',
        extra_roles_sub: 'Alguacil y Jefe de la Banda',
        extra_revolver: 'Duelo',
        extra_revolver_sub: 'Revólver cargado',
        extra_farsante: 'Farsante',
        extra_farsante_sub: 'Escribano y Falsificador',
        farsante_req: 'Requiere Placa',
        confirm: '¡Abrir la mesa!',
        min_players: 'Se necesitan al menos 5 jugadores para empezar.',
        max_players: 'Máximo de 10 jugadores alcanzado.',
        name_exists: 'Ese nombre ya existe.',
        close: 'Cerrar',
        leave_game_title: '¿Salir de la partida?',
        leave_game_text: 'Se perderá la partida en curso.',
        leave_game_yes: 'Salir',
        leave_game_no: 'Seguir jugando',
        remove_player: 'Quitar jugador',
        scroll_more: 'Desliza para ver más',

        pass_to: 'Pásale el teléfono a',
        confidential_to: 'Revelación confidencial para',
        no_peeking: 'Asegúrate de que nadie más esté mirando.',
        im_name: 'Soy {name}',

        your_identity: 'Tu identidad',
        reveal_card: 'Revelar carta',
        flip_card: 'Dar la vuelta a la carta',
        hide_card: 'Esconder y pasar',
        others_outlaws: 'Otros Forajidos',
        has_revolver: 'TIENES EL REVÓLVER',
        boss_tagged: '(Jefe)',
        delegate_notice: '<span class="delegate-target">{name}</span> es un forajido,<br>pero no dejes ver que lo sabes...',

        role_law: 'Equipo de la Ley',
        role_delegado: 'Alguacil',
        role_outlaw: 'Forajido',
        role_boss: 'Jefe de la Banda',
        role_escrivao: 'Escribano',
        role_falsificador: 'Falsificador',
        escrivao_desc1: 'Uno de estos es el Alguacil de verdad. El otro es un impostor. Descubre en quién confiar.',
        escrivao_title: '¿Alguacil o Falsificador?',
        falsificador_desc2: 'Pero te haces pasar por la autoridad.',
        falsificador_notice: 'El Escribano te ve como posible <b>Alguacil</b>. En el duelo, pareces de la <b>Ley</b>.',
        law_desc1: 'Ayuda al Sheriff en las misiones y descubre quiénes son los forajidos.',
        law_desc2: 'Debes cumplir todas las misiones en las que participes.',
        outlaw_desc1: 'Estás infiltrado en el pueblo.',
        outlaw_desc2: 'Sabotea (o no) las misiones sin que te descubran.',
        boss_desc2: 'Sabotea (o no) las misiones sin que te descubran y encuentra al alguacil.',

        rejected_teams: 'Equipos rechazados:',
        current_sheriff: 'Sheriff de la ronda:',
        sheriff_must: 'El sheriff debe formar un equipo de <strong id="mission-size-req" class="neon-text">X</strong> jugadores para la Misión <span id="current-mission-num">1</span>.',
        select_team: 'Elige el equipo:',
        propose_team: 'Proponer equipo',
        two_fails: '2 sabotajes',

        team_vote_title: 'Votación del equipo',
        proposed_by: 'Equipo propuesto por',
        voting_rules: '<p><strong>¡La votación es en grupo, ahora!</strong> Todos votan a la vez con los ojos cerrados (pulgar arriba = aprobar, pulgar abajo = rechazar).</p><p>Para que la misión salga se necesitan al menos <strong id="majority-number" class="destaque">X</strong> votos a favor.</p>',
        vote_yes_group: 'La mayoría APROBÓ',
        vote_no_group: 'La mayoría RECHAZÓ',

        mission_exec: 'Ejecutar misión',
        chip_cumprir: 'Cumplir',
        chip_sabotar: 'Sabotear',
        law_only: 'Los miembros de la Ley SOLO PUEDEN cumplir.',
        mission_result_title: 'Resultado de la misión',
        mission_chips_sub: 'Una ficha por miembro del equipo:',
        sabotages: 'Sabotajes:',
        next_phase: 'Siguiente fase',
        mission_success_t: '¡Misión cumplida!',
        mission_fail_t: '¡Misión saboteada!',
        mission_success_lore: 'La operación en Red Rock fue un éxito.',
        needed_two_fails: 'Hubo 1 sabotaje, pero esta misión solo fallaba con 2.',
        mission_fail_lore: '¡Había infiltrados en el equipo y la operación fracasó!',

        duel_time: 'Hora del duelo',
        duel_owner_has: '{name} tiene el revólver.',
        duel_choose: 'Elige a alguien para el duelo:',
        challenge: 'Desafiar',
        skip_duel: 'Saltar el duelo',
        duel_hold: 'Mantente firme. ¿Cómo reaccionas en este duelo?',
        shoot: 'DISPARAR',
        lower_gun: 'BAJAR EL ARMA',
        dust_settling: 'El polvo se está asentando...',
        duel_gaze: 'Duelo de miradas',
        duel_decided: 'Los dos jugadores ya decidieron en el duelo de miradas.',
        see_duel_result: 'Ver resultado del duelo',
        mission_ready: 'El equipo ya decidió',
        mission_n: 'Misión {n}',
        mission_ready_note: 'Pon el teléfono en el centro de la mesa, donde todos puedan verlo.',
        see_result: 'Ver resultado',
        duel_result_title: 'Resultado del duelo',
        continue_game: 'Continuar la partida',
        duel_both_shot: '¡Los dos dispararon!<br>Por suerte, ambos fallaron.',
        duel_both_down: 'Los dos bajaron las armas.<br>Hay paz, por ahora.',
        duel_mixed: 'Uno disparó y el otro bajó el arma.<br>Uno de los dos jugó sucio.',
        intimidation_title: 'Intimidación exitosa',
        belongs_team: 'El jugador <strong id="intimidated-name">NOMBRE</strong> pertenece al equipo:',
        understood_hide: 'Entendido, esconder',
        duel_started_you: 'Tú iniciaste el duelo',
        duel_challenged: '¡Te desafiaron!',
        law_resistance: 'LA LEY',
        outlaw_team: 'LOS FORAJIDOS',

        boss_last_chance: 'Última oportunidad del Jefe',
        boss_text: 'La Ley cumplió 3 misiones, pero al Jefe de la Banda le queda una última bala. Jefe, toma el teléfono e intenta acertarle al Alguacil.',
        assassinate: 'Asesinar',

        game_over: 'Fin de la partida',
        team_law: 'Equipo de la Ley',
        team_outlaws: 'Forajidos',
        play_again: 'Jugar de nuevo',
        traitor: 'Traidor',
        tag_boss: ' (JEFE)',
        tag_delegado: ' (ALGUACIL)',
        tag_escrivao: ' (ESCRIBANO)',
        tag_falsificador: ' (FALSIFICADOR)',
        win_outlaw_rejects: '¡Ganan los Forajidos! El pueblo rechazó 5 equipos seguidos.',
        win_law_missions: '¡Gana la Ley! El pueblo de Red Rock está a salvo.',
        win_outlaw_missions: '¡Ganan los Forajidos! Red Rock ha caído.',
        win_boss_shot: '¡BANG! ¡El Jefe de la Banda mató al Alguacil antes de huir! ¡Ganan los Forajidos!',
        win_boss_missed: 'El Jefe le disparó a la persona equivocada. ¡El pueblo los ejecutó a todos! ¡Victoria indiscutible de la Ley!',

        secret_choice: 'Tu elección es SECRETA. Nadie verá tu decisión.',
        choice_registered_short: '¡Elección registrada!',
        pass_phone: 'Pasar el teléfono',

        menu: 'Saloon',
        sound_on: 'Sonido activado',
        sound_off: 'Sonido desactivado',
        more_info: 'Más información',
        language: 'Idioma',
        home_screen: 'Pantalla de inicio',
        cancel: 'Cancelar',
        feedback: 'Enviar comentarios',
        feedback_title: 'Tus comentarios',
        feedback_text: '¿Una idea, un problema o un elogio? Escríbelo aquí y llegará directo a nuestro correo.',
        feedback_ph: 'Escribe tu mensaje...',
        feedback_send: 'Enviar',
        feedback_or: 'O escribe a',
        feedback_subject: 'Comentarios sobre Saloon',

        tutorials: {
            FARSANTE: `
                <p class="tut-sub">¿Quién es el verdadero informante de la Ley? Llegan dos personajes nuevos, y uno de ellos es pura fachada.</p>
                <div class="card">
                    <h2>Los dos papeles nuevos</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Escribano</span><span class="meta">De la Ley. Ve dos nombres, pero no sabe cuál es el Alguacil.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Falsificador</span><span class="meta">Forajido. Se hace pasar por la autoridad.</span></div></div>
                    <p>Esta expansión <strong>requiere al Alguacil y al Jefe</strong> (Placa).</p>
                </div>
                <div class="card">
                    <h2>El dilema del Escribano</h2>
                    <p>El Escribano ve <strong>dos nombres</strong>: uno es el <strong>Alguacil</strong> de verdad y el otro es el <strong>Falsificador</strong> disfrazado. Pero <strong>no sabe cuál es cuál</strong> y tiene que deducir en quién confiar.</p>
                </div>
                <div class="card">
                    <h2>El disfraz del Falsificador</h2>
                    <p>Es un <strong>forajido común</strong>: conoce a los demás bandidos y <strong>puede sabotear</strong>. El <strong>Alguacil no lo ve</strong>, así que puede mentir con libertad. En el <strong>duelo</strong>, parece de la <strong>Ley</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>Con la Farsante activa, el Alguacil ahora <strong>ve al Jefe</strong>, y quien desaparece de su vista es el <strong>Falsificador</strong>. Siempre son personas distintas.</span></div>
                </div>`,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> es un juego de deducción social para 5 a 10 jugadores. Confía en quien lo merece.</p>
                <div class="card">
                    <h2>Dos equipos, un pueblo</h2>
                    <p>Al principio, cada jugador recibe una carta <strong>secreta</strong> que define su equipo. Nadie más puede verla.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">Equipo de la Ley</span><span class="meta">La mayoría. No saben quién es quién.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Forajidos</span><span class="meta">La minoría infiltrada. Se conocen entre ellos.</span></div></div>
                    <p>La Ley gana cumpliendo misiones. Los Forajidos ganan saboteando sin que los descubran.</p>
                </div>
                <div class="card">
                    <h2>Objetivo: 3 fichas</h2>
                    <p>La partida tiene hasta <strong>5 misiones</strong>. Quien consiga primero <strong>3 fichas</strong> gana.</p>
                    <div class="chips-row" data-fichas="lei:2 lei:3 fora:2 3! 3"></div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>misión cumplida</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>misión saboteada</i>
                    </div>
                    <p style="margin-top:10px">El número de la ficha indica cuántos jugadores van a esa misión.</p>
                </div>
                <div class="card">
                    <h2>La ronda, paso a paso</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>El Sheriff forma el equipo</h3><p>Un jugador es el <strong>Sheriff</strong> de la ronda. Elige quién va a la misión (el número de la ficha). El cargo rota cada ronda.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Todos votan el equipo</h3><p><strong>Todo el mundo</strong> vota sí o no, incluso quien se quedó fuera. Con mayoría simple se aprueba y la misión empieza.</p><p>¿Rechazado? El cargo de Sheriff pasa al siguiente jugador, que propone otro equipo.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>La misión es secreta</h3><p>Cada elegido decide en el teléfono, a escondidas: <strong>cumplir</strong> o <strong>sabotear</strong>.</p><p>Quien es de la Ley <strong>solo puede cumplir</strong>. El Forajido elige: sabotear ayuda a su equipo, pero levanta sospechas.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>El resultado se vuelve ficha</h3><p>Los votos de la misión se revelan juntos, sin decir de quién son. <strong>Un solo sabotaje</strong> ya hace fallar la misión, y la ficha queda roja.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 equipos rechazados seguidos</strong> = el pueblo se derrumba. Victoria inmediata de los Forajidos. ¡No dejen que la votación se atasque!</span></div>
                    <div class="nota">En mesas grandes, algunas misiones necesitan <strong>2 sabotajes</strong> para fallar; la ficha lo avisa con "2 sabotajes".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Alguacil y Jefe</h2>
                    <p>Entran dos personajes especiales en la baraja, uno para cada equipo.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Alguacil</span><span class="meta">De la Ley. Empieza sabiendo quiénes son los Forajidos.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Jefe de la Banda</span><span class="meta">El único bandido que el Alguacil NO conoce.</span></div></div>
                    <p>El Alguacil tiene que usar lo que sabe con <strong>cautela</strong>: si se nota demasiado, se convierte en blanco.</p>
                    <div class="alerta"><span class="bang">!</span><span>Si la Ley gana las 3 misiones, el Jefe tiene <strong>una última bala</strong>: intentar adivinar quién es el Alguacil. Si acierta, los Forajidos <strong>roban la victoria</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><img class="tut-h2-img" src="images/revolver.png" alt=""> Revólver y duelo</h2>
                    <p>Un jugador empieza con el <strong>revólver</strong>. Después de las misiones 2 y 3, puede desafiar a alguien a un <strong>duelo de miradas</strong> (o pasar).</p>
                    <p>En el duelo, los dos eligen en secreto: <strong>disparar</strong> o <strong>bajar el arma</strong>.</p>
                    <div class="nota">Si los dos eligen <strong>lo mismo</strong>, el dueño del revólver descubre el <strong>equipo</strong> del rival, en secreto. Si eligen distinto, solo queda la tensión en el aire.</div>
                    <p style="margin-top:10px">Después del duelo, el revólver pasa al desafiado (sin devolución inmediata).</p>
                </div>`
        }
    },
    fr: {
        tap_start: 'Touchez pour entrer dans le saloon',

        setup_title: 'Notez les joueurs<br>dans l’ordre où ils sont assis :',
        name_ph: 'Nom du joueur',
        next: 'Suivant',
        how_to_play: 'Comment jouer',
        back: 'Retour',
        extras_title: 'Personnages bonus',
        extra_roles: 'Insigne',
        extra_roles_sub: 'Marshal et Chef de Gang',
        extra_revolver: 'Duel',
        extra_revolver_sub: 'Revolver chargé',
        extra_farsante: 'Imposture',
        extra_farsante_sub: 'Greffier et Faussaire',
        farsante_req: 'Nécessite l’Insigne',
        confirm: 'Ouvrir la table !',
        min_players: 'Il faut au moins 5 joueurs pour commencer.',
        max_players: 'Maximum de 10 joueurs atteint.',
        name_exists: 'Ce nom existe déjà.',
        close: 'Fermer',
        leave_game_title: 'Quitter la partie ?',
        leave_game_text: 'La partie en cours sera perdue.',
        leave_game_yes: 'Quitter',
        leave_game_no: 'Continuer',
        remove_player: 'Retirer le joueur',
        scroll_more: 'Glissez pour voir la suite',

        pass_to: 'Passez le téléphone à',
        confidential_to: 'Révélation confidentielle pour',
        no_peeking: 'Assurez-vous que personne d’autre ne regarde.',
        im_name: 'Je suis {name}',

        your_identity: 'Votre identité',
        reveal_card: 'Révéler la carte',
        flip_card: 'Retourner la carte',
        hide_card: 'Cacher et passer',
        others_outlaws: 'Autres Hors-la-loi',
        has_revolver: 'VOUS AVEZ LE REVOLVER',
        boss_tagged: '(Chef)',
        delegate_notice: '<span class="delegate-target">{name}</span> est un hors-la-loi,<br>mais ne montrez pas que vous le savez...',

        role_law: 'Camp de la Loi',
        role_delegado: 'Marshal',
        role_outlaw: 'Hors-la-loi',
        role_boss: 'Chef de Gang',
        role_escrivao: 'Greffier',
        role_falsificador: 'Faussaire',
        escrivao_desc1: 'L’un d’eux est le vrai Marshal. L’autre est un imposteur. À vous de savoir à qui faire confiance.',
        escrivao_title: 'Marshal ou Faussaire ?',
        falsificador_desc2: 'Mais vous vous faites passer pour l’autorité.',
        falsificador_notice: 'Le Greffier vous voit comme un <b>Marshal</b> possible. En duel, vous semblez être de la <b>Loi</b>.',
        law_desc1: 'Aidez le Shérif pendant les missions et démasquez les hors-la-loi.',
        law_desc2: 'Vous devez accomplir toutes les missions auxquelles vous participez.',
        outlaw_desc1: 'Vous êtes infiltré en ville.',
        outlaw_desc2: 'Sabotez (ou non) les missions sans vous faire remarquer.',
        boss_desc2: 'Sabotez (ou non) les missions sans vous faire remarquer, et trouvez le marshal.',

        rejected_teams: 'Équipes rejetées :',
        current_sheriff: 'Shérif de la manche :',
        sheriff_must: 'Le shérif doit former une équipe de <strong id="mission-size-req" class="neon-text">X</strong> joueurs pour la Mission <span id="current-mission-num">1</span>.',
        select_team: 'Choisissez l’équipe :',
        propose_team: 'Proposer l’équipe',
        two_fails: '2 sabotages',

        team_vote_title: 'Vote sur l’équipe',
        proposed_by: 'Équipe proposée par',
        voting_rules: '<p><strong>Le vote se fait en groupe, maintenant !</strong> Tout le monde vote en même temps, les yeux fermés (pouce levé = approuver, pouce baissé = rejeter).</p><p>Pour que la mission parte, il faut au moins <strong id="majority-number" class="destaque">X</strong> votes pour.</p>',
        vote_yes_group: 'La majorité a APPROUVÉ',
        vote_no_group: 'La majorité a REJETÉ',

        mission_exec: 'Lancer la mission',
        chip_cumprir: 'Accomplir',
        chip_sabotar: 'Saboter',
        law_only: 'Les membres de la Loi peuvent SEULEMENT accomplir.',
        mission_result_title: 'Résultat de la mission',
        mission_chips_sub: 'Un jeton par membre de l’équipe :',
        sabotages: 'Sabotages :',
        next_phase: 'Phase suivante',
        mission_success_t: 'Mission accomplie !',
        mission_fail_t: 'Mission sabotée !',
        mission_success_lore: 'L’opération à Red Rock est un succès.',
        needed_two_fails: 'Il y a eu 1 sabotage, mais cette mission n’échouait qu’avec 2.',
        mission_fail_lore: 'Il y avait des infiltrés dans l’équipe et l’opération a échoué !',

        duel_time: 'L’heure du duel',
        duel_owner_has: '{name} a le revolver.',
        duel_choose: 'Choisissez quelqu’un à défier :',
        challenge: 'Défier',
        skip_duel: 'Passer le duel',
        duel_hold: 'Tenez bon. Comment réagissez-vous dans ce duel ?',
        shoot: 'TIRER',
        lower_gun: 'BAISSER L’ARME',
        dust_settling: 'La poussière retombe...',
        duel_gaze: 'Duel de regards',
        duel_decided: 'Les deux joueurs ont fait leur choix dans le duel de regards.',
        see_duel_result: 'Voir le résultat du duel',
        mission_ready: 'L’équipe a décidé',
        mission_n: 'Mission {n}',
        mission_ready_note: 'Posez le téléphone au milieu de la table, là où tout le monde peut le voir.',
        see_result: 'Voir le résultat',
        duel_result_title: 'Résultat du duel',
        continue_game: 'Continuer la partie',
        duel_both_shot: 'Les deux ont tiré !<br>Heureusement, ils se sont ratés.',
        duel_both_down: 'Les deux ont baissé leur arme.<br>La paix, pour l’instant.',
        duel_mixed: 'L’un a tiré, l’autre a baissé son arme.<br>L’un des deux a joué un sale tour.',
        intimidation_title: 'Intimidation réussie',
        belongs_team: 'Le joueur <strong id="intimidated-name">NOM</strong> appartient au camp :',
        understood_hide: 'Compris, cacher',
        duel_started_you: 'Vous avez lancé le duel',
        duel_challenged: 'Vous avez été défié !',
        law_resistance: 'LA LOI',
        outlaw_team: 'HORS-LA-LOI',

        boss_last_chance: 'La dernière chance du Chef',
        boss_text: 'La Loi a accompli 3 missions, mais le Chef de Gang a encore une dernière balle. Chef, prenez le téléphone et essayez de toucher le Marshal.',
        assassinate: 'Abattre',

        game_over: 'Fin de la partie',
        team_law: 'Camp de la Loi',
        team_outlaws: 'Hors-la-loi',
        play_again: 'Rejouer',
        traitor: 'Traître',
        tag_boss: ' (CHEF)',
        tag_delegado: ' (MARSHAL)',
        tag_escrivao: ' (GREFFIER)',
        tag_falsificador: ' (FAUSSAIRE)',
        win_outlaw_rejects: 'Victoire des Hors-la-loi ! La ville a rejeté 5 équipes d’affilée.',
        win_law_missions: 'Victoire de la Loi ! La ville de Red Rock est sauvée.',
        win_outlaw_missions: 'Victoire des Hors-la-loi ! Red Rock est tombée.',
        win_boss_shot: 'BANG ! Le Chef de Gang a abattu le Marshal avant de s’enfuir ! Victoire des Hors-la-loi !',
        win_boss_missed: 'Le Chef a tiré sur la mauvaise personne. La ville les a tous exécutés ! Victoire incontestable de la Loi !',

        secret_choice: 'Votre choix est SECRET. Personne ne verra votre décision.',
        choice_registered_short: 'Choix enregistré !',
        pass_phone: 'Passer le téléphone',

        menu: 'Saloon',
        sound_on: 'Son activé',
        sound_off: 'Son désactivé',
        more_info: 'En savoir plus',
        language: 'Langue',
        home_screen: 'Écran d’accueil',
        cancel: 'Annuler',
        feedback: 'Envoyer un avis',
        feedback_title: 'Votre avis',
        feedback_text: 'Une idée, un problème ou un compliment ? Écrivez-le ici, il arrive directement dans notre boîte mail.',
        feedback_ph: 'Écrivez votre message...',
        feedback_send: 'Envoyer',
        feedback_or: 'Ou écrivez à',
        feedback_subject: 'Avis sur Saloon',

        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Qui est le vrai informateur de la Loi ? Deux nouveaux personnages arrivent, et l’un d’eux n’est qu’une façade.</p>
                <div class="card">
                    <h2>Les deux nouveaux rôles</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Greffier</span><span class="meta">Camp de la Loi. Voit deux noms, sans savoir lequel est le Marshal.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Faussaire</span><span class="meta">Hors-la-loi. Se fait passer pour l’autorité.</span></div></div>
                    <p>Cette extension <strong>nécessite le Marshal et le Chef</strong> (Insigne).</p>
                </div>
                <div class="card">
                    <h2>Le dilemme du Greffier</h2>
                    <p>Le Greffier voit <strong>deux noms</strong> : l’un est le vrai <strong>Marshal</strong>, l’autre est le <strong>Faussaire</strong> déguisé. Mais il <strong>ne sait pas qui est qui</strong> et doit deviner à qui faire confiance.</p>
                </div>
                <div class="card">
                    <h2>Le déguisement du Faussaire</h2>
                    <p>C’est un <strong>hors-la-loi ordinaire</strong> : il connaît les autres bandits et <strong>peut saboter</strong>. Le <strong>Marshal ne le voit pas</strong>, il peut donc bluffer librement. En <strong>duel</strong>, il apparaît comme membre de la <strong>Loi</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>Avec l’Imposture activée, le Marshal <strong>voit le Chef</strong>, et c’est le <strong>Faussaire</strong> qui lui échappe. Ce sont toujours deux personnes différentes.</span></div>
                </div>`,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> est un jeu de déduction sociale pour 5 à 10 joueurs. Faites confiance aux bonnes personnes.</p>
                <div class="card">
                    <h2>Deux camps, une ville</h2>
                    <p>Au début, chaque joueur reçoit une carte <strong>secrète</strong> qui définit son camp. Personne d’autre ne peut la voir.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">Camp de la Loi</span><span class="meta">La majorité. Ils ne savent pas qui est qui.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Hors-la-loi</span><span class="meta">La minorité infiltrée. Ils se connaissent entre eux.</span></div></div>
                    <p>La Loi gagne en accomplissant des missions. Les Hors-la-loi gagnent en sabotant sans se faire prendre.</p>
                </div>
                <div class="card">
                    <h2>Objectif : 3 jetons</h2>
                    <p>Une partie compte jusqu’à <strong>5 missions</strong>. Le premier camp à remporter <strong>3 jetons</strong> gagne.</p>
                    <div class="chips-row" data-fichas="lei:2 lei:3 fora:2 3! 3"></div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>mission accomplie</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>mission sabotée</i>
                    </div>
                    <p style="margin-top:10px">Le chiffre sur le jeton indique combien de joueurs partent pour cette mission.</p>
                </div>
                <div class="card">
                    <h2>La manche, étape par étape</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>Le Shérif forme l’équipe</h3><p>Un joueur est le <strong>Shérif</strong> de la manche. Il choisit qui part en mission (le chiffre sur le jeton). Le rôle tourne à chaque manche.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Tout le monde vote sur l’équipe</h3><p><strong>Tout le monde</strong> vote oui ou non, même ceux qui ne font pas partie de l’équipe. Si la majorité simple approuve, la mission commence.</p><p>Rejetée ? L’étoile de Shérif passe au joueur suivant, qui propose une autre équipe.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>La mission est secrète</h3><p>Chaque joueur choisi décide sur le téléphone, en cachette : <strong>accomplir</strong> ou <strong>saboter</strong>.</p><p>Les membres de la Loi <strong>ne peuvent qu’accomplir</strong>. Le Hors-la-loi choisit : saboter aide son camp, mais éveille les soupçons.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>Le résultat devient un jeton</h3><p>Les votes de la mission sont révélés ensemble, sans dire qui a voté quoi. <strong>Un seul sabotage</strong> suffit à faire échouer la mission, et le jeton devient rouge.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 équipes rejetées d’affilée</strong> = la ville s’effondre. Victoire immédiate des Hors-la-loi. Ne laissez pas le vote s’enliser !</span></div>
                    <div class="nota">Aux grandes tables, certaines missions demandent <strong>2 sabotages</strong> pour échouer : le jeton l’indique avec « 2 sabotages ».</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Marshal et Chef</h2>
                    <p>Deux personnages spéciaux entrent dans le paquet, un pour chaque camp.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Marshal</span><span class="meta">Camp de la Loi. Sait dès le départ qui sont les Hors-la-loi.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Chef de Gang</span><span class="meta">Le seul bandit que le Marshal NE connaît PAS.</span></div></div>
                    <p>Le Marshal doit utiliser ce qu’il sait avec <strong>prudence</strong> : s’il se dévoile trop, il devient une cible.</p>
                    <div class="alerta"><span class="bang">!</span><span>Si la Loi gagne les 3 missions, le Chef a <strong>une dernière balle</strong> : deviner qui est le Marshal. S’il vise juste, les Hors-la-loi <strong>volent la victoire</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><img class="tut-h2-img" src="images/revolver.png" alt=""> Revolver et duel</h2>
                    <p>Un joueur commence avec le <strong>revolver</strong>. Après les missions 2 et 3, il peut défier quelqu’un en <strong>duel de regards</strong> (ou passer).</p>
                    <p>Pendant le duel, les deux choisissent en secret : <strong>tirer</strong> ou <strong>baisser l’arme</strong>.</p>
                    <div class="nota">S’ils choisissent <strong>la même chose</strong>, le propriétaire du revolver découvre le <strong>camp</strong> de l’adversaire, en secret. S’ils choisissent différemment, seule la tension reste dans l’air.</div>
                    <p style="margin-top:10px">Après le duel, le revolver passe au joueur défié (sans retour immédiat).</p>
                </div>`
        }
    },
    de: {
        tap_start: 'Tippe, um den Saloon zu betreten',

        setup_title: 'Tragt die Spieler<br>in Sitzreihenfolge ein:',
        name_ph: 'Spielername',
        next: 'Weiter',
        how_to_play: 'Spielregeln',
        back: 'Zurück',
        extras_title: 'Zusätzliche Figuren',
        extra_roles: 'Abzeichen',
        extra_roles_sub: 'Marshal und Bandenboss',
        extra_revolver: 'Duell',
        extra_revolver_sub: 'Geladener Revolver',
        extra_farsante: 'Hochstapler',
        extra_farsante_sub: 'Schreiber und Fälscher',
        farsante_req: 'Benötigt Abzeichen',
        confirm: 'Tisch eröffnen!',
        min_players: 'Zum Starten braucht ihr mindestens 5 Spieler.',
        max_players: 'Höchstzahl von 10 Spielern erreicht.',
        name_exists: 'Diesen Namen gibt es schon.',
        close: 'Schließen',
        leave_game_title: 'Partie verlassen?',
        leave_game_text: 'Die laufende Partie geht verloren.',
        leave_game_yes: 'Verlassen',
        leave_game_no: 'Weiterspielen',
        remove_player: 'Spieler entfernen',
        scroll_more: 'Wischen für mehr',

        pass_to: 'Gib das Handy weiter an',
        confidential_to: 'Geheime Enthüllung für',
        no_peeking: 'Stell sicher, dass niemand sonst zusieht.',
        im_name: 'Ich bin {name}',

        your_identity: 'Deine Identität',
        reveal_card: 'Karte aufdecken',
        flip_card: 'Karte umdrehen',
        hide_card: 'Verdecken und weitergeben',
        others_outlaws: 'Andere Gesetzlose',
        has_revolver: 'DU HAST DEN REVOLVER',
        boss_tagged: '(Boss)',
        delegate_notice: '<span class="delegate-target">{name}</span> ist ein Gesetzloser,<br>aber lass dir nicht anmerken, dass du es weißt...',

        role_law: 'Gesetzeshüter',
        role_delegado: 'Marshal',
        role_outlaw: 'Gesetzloser',
        role_boss: 'Bandenboss',
        role_escrivao: 'Schreiber',
        role_falsificador: 'Fälscher',
        escrivao_desc1: 'Einer der beiden ist der echte Marshal. Der andere ist ein Betrüger. Finde heraus, wem du trauen kannst.',
        escrivao_title: 'Marshal oder Fälscher?',
        falsificador_desc2: 'Aber du gibst dich als Autorität aus.',
        falsificador_notice: 'Für den Schreiber bist du ein möglicher <b>Marshal</b>. Im Duell wirkst du wie das <b>Gesetz</b>.',
        law_desc1: 'Hilf dem Sheriff bei den Missionen und finde heraus, wer die Gesetzlosen sind.',
        law_desc2: 'Du musst jede Mission erfüllen, an der du teilnimmst.',
        outlaw_desc1: 'Du bist in die Stadt eingeschleust.',
        outlaw_desc2: 'Sabotiere die Missionen (oder nicht), ohne aufzufallen.',
        boss_desc2: 'Sabotiere die Missionen (oder nicht), ohne aufzufallen, und finde den Marshal.',

        rejected_teams: 'Abgelehnte Teams:',
        current_sheriff: 'Sheriff dieser Runde:',
        sheriff_must: 'Der Sheriff muss ein Team aus <strong id="mission-size-req" class="neon-text">X</strong> Spielern für Mission <span id="current-mission-num">1</span> aufstellen.',
        select_team: 'Wähle das Team:',
        propose_team: 'Team vorschlagen',
        two_fails: '2 Sabotagen',

        team_vote_title: 'Abstimmung',
        proposed_by: 'Team vorgeschlagen von',
        voting_rules: '<p><strong>Abgestimmt wird gemeinsam, jetzt!</strong> Alle stimmen gleichzeitig mit geschlossenen Augen ab (Daumen hoch = annehmen, Daumen runter = ablehnen).</p><p>Damit die Mission startet, braucht es mindestens <strong id="majority-number" class="destaque">X</strong> Ja-Stimmen.</p>',
        vote_yes_group: 'Mehrheit DAFÜR',
        vote_no_group: 'Mehrheit DAGEGEN',

        mission_exec: 'Mission ausführen',
        chip_cumprir: 'Erfüllen',
        chip_sabotar: 'Sabotieren',
        law_only: 'Gesetzeshüter können NUR erfüllen.',
        mission_result_title: 'Ergebnis der Mission',
        mission_chips_sub: 'Ein Chip pro Teammitglied:',
        sabotages: 'Sabotagen:',
        next_phase: 'Nächste Phase',
        mission_success_t: 'Mission erfüllt!',
        mission_fail_t: 'Mission sabotiert!',
        mission_success_lore: 'Die Operation in Red Rock war ein Erfolg.',
        needed_two_fails: 'Es gab 1 Sabotage, aber diese Mission scheitert erst bei 2.',
        mission_fail_lore: 'Im Team waren Verräter, und die Operation ist gescheitert!',

        duel_time: 'Zeit für ein Duell',
        duel_owner_has: '{name} hat den Revolver.',
        duel_choose: 'Wähle jemanden für das Duell:',
        challenge: 'Herausfordern',
        skip_duel: 'Duell auslassen',
        duel_hold: 'Bleib standhaft. Wie reagierst du in diesem Duell?',
        shoot: 'SCHIESSEN',
        lower_gun: 'WAFFE SENKEN',
        dust_settling: 'Der Staub legt sich...',
        duel_gaze: 'Blickduell',
        duel_decided: 'Beide Spieler haben im Blickduell ihre Wahl getroffen.',
        see_duel_result: 'Ergebnis des Duells',
        mission_ready: 'Das Team hat entschieden',
        mission_n: 'Mission {n}',
        mission_ready_note: 'Leg das Handy in die Tischmitte, wo alle es sehen können.',
        see_result: 'Ergebnis ansehen',
        duel_result_title: 'Ergebnis des Duells',
        continue_game: 'Weiterspielen',
        duel_both_shot: 'Beide haben geschossen!<br>Zum Glück haben beide verfehlt.',
        duel_both_down: 'Beide haben die Waffe gesenkt.<br>Friede, vorerst.',
        duel_mixed: 'Einer hat geschossen, der andere die Waffe gesenkt.<br>Einer der beiden hat ein falsches Spiel getrieben.',
        intimidation_title: 'Einschüchterung gelungen',
        belongs_team: 'Spieler <strong id="intimidated-name">NAME</strong> gehört zu:',
        understood_hide: 'Verstanden, verdecken',
        duel_started_you: 'Du hast das Duell begonnen',
        duel_challenged: 'Du wurdest herausgefordert!',
        law_resistance: 'DAS GESETZ',
        outlaw_team: 'GESETZLOSE',

        boss_last_chance: 'Die letzte Chance des Bosses',
        boss_text: 'Das Gesetz hat 3 Missionen erfüllt, aber der Bandenboss hat noch eine letzte Kugel. Boss, nimm das Handy und versuche, den Marshal zu treffen.',
        assassinate: 'Erschießen',

        game_over: 'Spielende',
        team_law: 'Gesetzeshüter',
        team_outlaws: 'Gesetzlose',
        play_again: 'Nochmal spielen',
        traitor: 'Verräter',
        tag_boss: ' (BOSS)',
        tag_delegado: ' (MARSHAL)',
        tag_escrivao: ' (SCHREIBER)',
        tag_falsificador: ' (FÄLSCHER)',
        win_outlaw_rejects: 'Die Gesetzlosen gewinnen! Die Stadt hat 5 Teams in Folge abgelehnt.',
        win_law_missions: 'Das Gesetz gewinnt! Die Stadt Red Rock ist gerettet.',
        win_outlaw_missions: 'Die Gesetzlosen gewinnen! Red Rock ist gefallen.',
        win_boss_shot: 'BANG! Der Bandenboss hat den Marshal vor der Flucht erschossen! Die Gesetzlosen gewinnen!',
        win_boss_missed: 'Der Boss hat auf die falsche Person geschossen. Die Stadt hat sie alle hingerichtet! Unangefochtener Sieg für das Gesetz!',

        secret_choice: 'Deine Wahl ist GEHEIM. Niemand sieht deine Entscheidung.',
        choice_registered_short: 'Wahl gespeichert!',
        pass_phone: 'Handy weitergeben',

        menu: 'Saloon',
        sound_on: 'Ton an',
        sound_off: 'Ton aus',
        more_info: 'Mehr erfahren',
        language: 'Sprache',
        home_screen: 'Startbildschirm',
        cancel: 'Abbrechen',
        feedback: 'Feedback senden',
        feedback_title: 'Dein Feedback',
        feedback_text: 'Eine Idee, ein Problem oder ein Lob? Schreib es hier, und es landet direkt in unserem Postfach.',
        feedback_ph: 'Schreib deine Nachricht...',
        feedback_send: 'Senden',
        feedback_or: 'Oder schreib an',
        feedback_subject: 'Feedback zu Saloon',

        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Wer ist der wahre Informant des Gesetzes? Zwei neue Figuren kommen ins Spiel, und eine davon ist reine Fassade.</p>
                <div class="card">
                    <h2>Die zwei neuen Rollen</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Schreiber</span><span class="meta">Gesetzeshüter. Sieht zwei Namen, weiß aber nicht, wer der Marshal ist.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Fälscher</span><span class="meta">Gesetzloser. Gibt sich als Autorität aus.</span></div></div>
                    <p>Diese Erweiterung <strong>benötigt den Marshal und den Boss</strong> (Abzeichen).</p>
                </div>
                <div class="card">
                    <h2>Das Dilemma des Schreibers</h2>
                    <p>Der Schreiber sieht <strong>zwei Namen</strong>: Einer ist der echte <strong>Marshal</strong>, der andere der getarnte <strong>Fälscher</strong>. Er <strong>weiß aber nicht, wer wer ist</strong>, und muss herausfinden, wem er trauen kann.</p>
                </div>
                <div class="card">
                    <h2>Die Tarnung des Fälschers</h2>
                    <p>Er ist ein <strong>gewöhnlicher Gesetzloser</strong>: Er kennt die anderen Banditen und <strong>kann sabotieren</strong>. Der <strong>Marshal sieht ihn nicht</strong>, also kann er frei bluffen. Im <strong>Duell</strong> erscheint er als <strong>Gesetzeshüter</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>Ist „Hochstapler“ aktiv, <strong>sieht der Marshal den Boss</strong>, und vor ihm verborgen bleibt der <strong>Fälscher</strong>. Die beiden sind immer verschiedene Personen.</span></div>
                </div>`,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> ist ein Social-Deduction-Spiel für 5 bis 10 Spieler. Vertraue den Richtigen.</p>
                <div class="card">
                    <h2>Zwei Teams, eine Stadt</h2>
                    <p>Zu Beginn bekommt jeder Spieler eine <strong>geheime</strong> Karte, die sein Team festlegt. Niemand sonst darf sie sehen.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">Gesetzeshüter</span><span class="meta">Die Mehrheit. Sie wissen nicht, wer wer ist.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Gesetzlose</span><span class="meta">Die eingeschleuste Minderheit. Sie kennen sich untereinander.</span></div></div>
                    <p>Das Gesetz gewinnt, indem es Missionen erfüllt. Die Gesetzlosen gewinnen, indem sie sabotieren, ohne erwischt zu werden.</p>
                </div>
                <div class="card">
                    <h2>Ziel: 3 Chips</h2>
                    <p>Eine Partie hat bis zu <strong>5 Missionen</strong>. Wer zuerst <strong>3 Chips</strong> holt, gewinnt.</p>
                    <div class="chips-row" data-fichas="lei:2 lei:3 fora:2 3! 3"></div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>Mission erfüllt</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>Mission sabotiert</i>
                    </div>
                    <p style="margin-top:10px">Die Zahl auf dem Chip zeigt, wie viele Spieler auf diese Mission gehen.</p>
                </div>
                <div class="card">
                    <h2>Die Runde, Schritt für Schritt</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>Der Sheriff stellt das Team auf</h3><p>Ein Spieler ist der <strong>Sheriff</strong> der Runde. Er wählt, wer auf die Mission geht (die Zahl auf dem Chip). Das Amt wechselt jede Runde.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Alle stimmen über das Team ab</h3><p><strong>Alle</strong> stimmen mit Ja oder Nein, auch wer nicht im Team ist. Stimmt die einfache Mehrheit dafür, beginnt die Mission.</p><p>Abgelehnt? Das Sheriff-Amt geht an den nächsten Spieler, der ein anderes Team vorschlägt.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>Die Mission ist geheim</h3><p>Jeder Ausgewählte entscheidet verdeckt am Handy: <strong>erfüllen</strong> oder <strong>sabotieren</strong>.</p><p>Gesetzeshüter <strong>können nur erfüllen</strong>. Gesetzlose haben die Wahl: Sabotage hilft ihrem Team, weckt aber Verdacht.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>Das Ergebnis wird zum Chip</h3><p>Die Missionsstimmen werden gemeinsam aufgedeckt, ohne zu verraten, von wem sie stammen. <strong>Eine einzige Sabotage</strong> lässt die Mission scheitern, und der Chip wird rot.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 abgelehnte Teams in Folge</strong> = die Stadt bricht zusammen. Sofortiger Sieg der Gesetzlosen. Lasst die Abstimmung nicht stocken!</span></div>
                    <div class="nota">An großen Tischen brauchen manche Missionen <strong>2 Sabotagen</strong>, um zu scheitern. Der Chip zeigt dann „2 Sabotagen“.</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Marshal und Boss</h2>
                    <p>Zwei besondere Figuren kommen ins Deck, eine für jedes Team.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Marshal</span><span class="meta">Gesetzeshüter. Weiß von Anfang an, wer die Gesetzlosen sind.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Bandenboss</span><span class="meta">Der einzige Bandit, den der Marshal NICHT kennt.</span></div></div>
                    <p>Der Marshal muss sein Wissen <strong>vorsichtig</strong> einsetzen: Wer sich zu offen verrät, wird zur Zielscheibe.</p>
                    <div class="alerta"><span class="bang">!</span><span>Gewinnt das Gesetz 3 Missionen, hat der Boss <strong>eine letzte Kugel</strong>: Er muss erraten, wer der Marshal ist. Trifft er, <strong>stehlen die Gesetzlosen den Sieg</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><img class="tut-h2-img" src="images/revolver.png" alt=""> Revolver und Duell</h2>
                    <p>Ein Spieler beginnt mit dem <strong>Revolver</strong>. Nach den Missionen 2 und 3 kann er jemanden zu einem <strong>Blickduell</strong> herausfordern (oder aussetzen).</p>
                    <p>Im Duell wählen beide geheim: <strong>schießen</strong> oder <strong>die Waffe senken</strong>.</p>
                    <div class="nota">Wählen beide <strong>dasselbe</strong>, erfährt der Revolverbesitzer heimlich das <strong>Team</strong> des Gegners. Wählen sie unterschiedlich, bleibt nur die Spannung in der Luft.</div>
                    <p style="margin-top:10px">Nach dem Duell geht der Revolver an den Herausgeforderten (keine sofortige Rückgabe).</p>
                </div>`
        }
    }
};

// ── Estado do idioma ─────────────────────────
// Vale o que a pessoa escolheu no menu. Na primeira visita, o idioma do
// aparelho, se for um dos cinco; senão, português.
function _idiomaInicial() {
    const salvo = localStorage.getItem('saloon_lang');
    if (salvo && I18N[salvo]) return salvo;
    const doAparelho = (navigator.languages || [navigator.language || ''])
        .map(l => String(l).slice(0, 2).toLowerCase())
        .find(l => I18N[l]);
    return doAparelho || 'pt';
}
let LANG = _idiomaInicial();

function t(key, vars) {
    let str = I18N[LANG][key];
    // Texto que faltar num idioma novo cai no inglês antes do português.
    if (str === undefined && LANG !== 'pt') str = I18N.en[key];
    if (str === undefined) str = I18N.pt[key];
    if (str === undefined) return key;
    if (vars) {
        for (const k in vars) {
            str = str.split('{' + k + '}').join(vars[k]);
        }
    }
    return str;
}

function setLanguage(lang) {
    if (!I18N[lang]) return;
    LANG = lang;
    localStorage.setItem('saloon_lang', lang);
    applyLanguage();
    // Telas montadas pelo jogo (tutorial, avisos do setup) se refazem.
    document.dispatchEvent(new Event('idioma'));
}

// Aplica as traduções nos elementos estáticos do HTML
function applyLanguage() {
    document.documentElement.lang = IDIOMAS[LANG].html;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });
    // Frases com números preenchidos pelo jogo (tamanho da equipe, votos,
    // nome do intimidado): o texto novo entra, mas os valores ficam.
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const valores = {};
        el.querySelectorAll('[id]').forEach(filho => { valores[filho.id] = filho.innerText; });
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
        for (const id in valores) {
            const filho = el.querySelector('#' + id);
            if (filho && valores[id] !== undefined) filho.innerText = valores[id];
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    // Nome falado pelo leitor de tela (VoiceOver) em botões só com ícone.
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    // O botão "Idioma" do menu mostra só a bandeira do idioma atual.
    const bandeira = document.getElementById('menu-lang-bandeira');
    if (bandeira) bandeira.innerHTML = IDIOMAS[LANG].bandeira;

    // Botão de som depende do estado do AudioManager
    if (typeof AudioManager !== 'undefined') AudioManager.rotulo();
}
