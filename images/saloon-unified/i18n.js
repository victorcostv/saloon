// ════════════════════════════════════════════
// SALOON — i18n (PT padrão / EN no menu lateral)
// ════════════════════════════════════════════

const I18N = {
    pt: {
        // ---- Splash / modos ----
        tap_start: 'Toque para entrar no saloon',
        choose_mode: 'Escolha a mesa',
        mode_offline: 'Pass & Play (Offline)',
        mode_online: 'Jogar Online',

        // ---- Setup ----
        setup_title: 'Anote os jogadores<br>na ordem em que estão sentados:',
        name_ph: 'Nome do jogador',
        next: 'Próximo',
        how_to_play: 'Como jogar',
        back_menu: 'Voltar ao menu',
        back: 'Voltar',
        extras_title: 'Personagens extras',
        extra_roles: 'Distintivo',
        extra_roles_sub: 'Delegado e Chefe da Gangue',
        extra_roles_inline: 'Distintivo',
        extra_revolver: 'Duelo',
        extra_revolver_sub: 'Revólver carregado',
        extra_farsante: 'Farsante',
        extra_farsante_sub: 'Escrivão e Falsificador',
        farsante_req: 'Requer Distintivo',
        party_mode_title: 'Modo Party',
        party_mode_sub: 'Este aparelho vira a tela. Jogadores entram pelo celular.',
        screen_join_title: 'Entrem pelo celular',
        screen_join_sub: 'Abram o Saloon, escolham "Entrar em sala" e digitem o código acima.',
        screen_join_sub_qr: 'Escaneiem o QR code ou entrem com o código da sala.',
        screen_scan_to_join: 'Aponte a câmera',
        screen_dealing_title: 'Distribuindo as cartas',
        screen_dealing_sub: 'Todos estão vendo suas cartas...',
        screen_dealing_comp: 'Hoje em Red Rock temos',
        dealing_side_law: 'A Lei',
        dealing_side_outlaw: 'Fora da Lei',
        screen_track: 'Trilha',
        screen_sheriff_picks: '{name} monta uma equipe de {size} agentes.',
        rejected_teams_short: 'Rejeições',
        screen_mission_label: 'Missão',
        screen_sheriff_label: 'Xerife',
        screen_vote_title: 'Votação da Equipe',
        screen_vote_sub: 'A mesa decide: esta equipe vai para a Missão {num}?',
        screen_of: 'de',
        screen_voted: 'votaram',
        proposed_team: 'Equipe Proposta',
        screen_mission_title: 'Missão em Andamento',
        screen_mission_sub: 'Os agentes partiram para Red Rock...',
        screen_mission_dust: 'O DESERTO OBSERVA EM SILÊNCIO',
        screen_agents_decided: 'agentes decidiram',
        mission_success: 'Missão Cumprida!',
        mission_failed: 'Missão Sabotada!',
        one_sabotage: 'sabotagem',
        n_sabotages: 'sabotagens',
        vote_yes_label: 'Aprovaram',
        vote_no_label: 'Rejeitaram',
        screen_vote_timeout: 'O tempo acabou! A equipe foi aprovada automaticamente.',
        law_wins: 'A Lei Venceu!',
        outlaw_wins: 'Os Fora-da-Lei Venceram!',
        screen_boss_title: 'A Última Bala',
        screen_boss_sub: 'O Chefe da Gangue tenta adivinhar quem é o Delegado...',
        screen_boss_dust: 'UM TIRO. UMA CHANCE.',
        screen_new_game: 'Nova Partida',
        phone_watch_screen_result: 'O resultado e os papéis foram revelados no telão!',
        phone_boss_aiming_title: 'O Chefe está mirando',
        phone_boss_aiming_sub: 'Acompanhe pelo telão o desfecho da última bala.',
        screen_duel_title: 'Hora do Duelo',
        screen_duel_choose_sub: '{name} tem o revólver e escolhe quem desafiar...',
        screen_duel_dust: 'A POEIRA BAIXA SOBRE RED ROCK',
        screen_duel_faceoff_title: 'Frente a Frente',
        screen_duel_faceoff_sub: 'Atirar ou recuar? Os dois decidem em segredo...',
        screen_duel_done: 'O Duelo Terminou',
        screen_duel_resolved: 'OS SEGREDOS FORAM REVELADOS NO ACERTO DE CONTAS',
        phone_duel_title: 'Hora do Duelo',
        phone_duel_sub: 'Acompanhe o duelo pelo telão.',
        screen_start: 'Começar a partida',
        screen_need_players: 'Aguardando jogadores (mínimo 5)',
        screen_need_players_count: 'Aguardando jogadores: {count}/5',
        phone_summary_eyebrow: 'A mesa de Red Rock',
        phone_watch_hint: 'Acompanhe pelo telão. Seu celular avisa quando for sua vez.',
        phone_review_card: 'Rever minha carta',
        phone_back_summary: 'Voltar',
        phone_desc_law: 'Ajude o Xerife a cumprir as missões e descubra os fora-da-lei infiltrados.',
        phone_desc_delegado: 'Você conhece os fora-da-lei desde o início, mas aja com cautela para não se entregar.',
        phone_desc_escrivao: 'Você vê dois nomes: o Delegado verdadeiro e o Falsificador. Descubra em quem confiar.',
        phone_desc_outlaw: 'Sabote as missões sem ser percebido e leve a gangue à vitória.',
        phone_desc_boss: 'Lidera a gangue. Se a Lei vencer 3 missões, tenta adivinhar o Delegado para roubar a vitória.',
        phone_desc_falsificador: 'Fora-da-lei que finge ser a autoridade. Aparece como possível Delegado e parece da Lei no duelo.',
        extra_revolver_inline: 'Duelo',
        extra_farsante_inline: 'Farsante',
        confirm: 'Abrir a mesa!',
        min_players: 'Mínimo de 5 jogadores para iniciar.',
        max_players: 'Máximo de 10 jogadores alcançado.',
        name_exists: 'Nome já existe.',
        close: 'Fechar',

        // ---- Passe o celular / confirmação ----
        pass_to: 'Passe o celular para',
        confidential_to: 'Revelação confidencial para',
        are_you: 'Você é <b>{name}</b>?',
        yes_me: 'Sim, sou eu',
        not_me: 'Não',
        pass_hint: 'Então entregue o celular para {name}.',
        no_peeking: 'Certifique-se de que ninguém mais está olhando.',

        // ---- Revelação de carta ----
        your_identity: 'Sua identidade',
        view_card: 'Espiar a carta',
        flip_card: 'Virar a carta',
        hide_card: 'Esconder e passar adiante',
        understood: 'Entendi',
        others_outlaws: 'Outros Fora-da-Lei',
        has_revolver: 'VOCÊ POSSUI O REVÓLVER',
        boss_tagged: '(Chefe)',
        delegate_notice: '<span class="delegate-target">{name}</span> é um fora-da-lei,<br>mas não deixe claro que você sabe disso...',

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
        law_desc1: 'Ajude o Xerife nas missões e descubra quem são os fora-da-lei.',
        law_desc2: 'Você deve cumprir todas as missões em que estiver.',
        outlaw_desc1: 'Você está infiltrado na cidade.',
        outlaw_desc2: 'Sabote (ou não) as missões sem ser percebido.',
        boss_desc2: 'Sabote (ou não) as missões sem ser percebido e descubra o delegado.',

        // ---- Tabuleiro ----
        rejected_teams: 'Equipes rejeitadas:',
        current_sheriff: 'Xerife da rodada:',
        sheriff_must: 'O xerife monta uma equipe de <strong id="mission-size-req" class="neon-text">X</strong> jogadores para a Missão <span id="current-mission-num">1</span>.',
        select_team: 'Selecione a equipe:',
        propose_team: 'Propor equipe',
        waiting_sheriff: 'Aguardando o Xerife propor uma equipe...',
        start_voting: 'Iniciar votação',
        two_fails: '2 sabotagens',
        mission_n: 'Missão',

        // ---- Votação (offline) ----
        team_vote_title: 'Votação da equipe',
        proposed_by: 'Equipe proposta por',
        voting_rules: '<p><strong>A votação é feita em grupo, agora!</strong> Todos votam ao mesmo tempo de olhos fechados (polegar para cima = aprovar, para baixo = rejeitar).</p><p>Para a missão sair, são necessários pelo menos <strong id="majority-number" class="neon-text yellow">X</strong> votos de aprovação.</p>',
        vote_yes_group: 'Maioria APROVOU',
        vote_no_group: 'Maioria REJEITOU',

        // ---- Missão ----
        mission_exec: 'Executar missão',
        mission_do: 'CUMPRIR missão',
        chip_cumprir: 'Cumprir',
        chip_sabotar: 'Sabotar',
        mission_sabotage: 'SABOTAR missão',
        law_only: 'Membros da Lei SÓ PODEM cumprir.',
        mission_done_title: 'Missão concluída',
        mission_done_p: 'A equipe fez suas escolhas em segredo.',
        mission_done_q: 'O que será que aconteceu no deserto de Red Rock?',
        reveal_mission: 'Revelar resultado',
        mission_result_title: 'Resultado da missão',
        mission_chips_sub: 'Uma ficha por membro da equipe:',
        sabotages: 'Sabotagens:',
        next_phase: 'Próxima fase',
        mission_success_t: 'Missão bem-sucedida!',
        mission_fail_t: 'Missão sabotada!',
        mission_success_lore: 'A operação em Red Rock foi concluída.',
        mission_fail_lore: 'Havia infiltrados na equipe e a operação falhou!',

        // ---- Duelo ----
        duel_time: 'Hora do duelo',
        duel_owner_has: '{name} possui o revólver.',
        duel_choose: 'Você possui o revólver. Escolha alguém para duelar:',
        challenge: 'Desafiar',
        skip_duel: 'Pular duelo',
        duel_actions: 'Suas ações',
        duel_hold: 'Mantenha-se firme. Como você reage neste duelo?',
        shoot: 'ATIRAR',
        lower_gun: 'ABAIXAR A ARMA',
        dust_settling: 'A poeira está baixando...',
        duel_decided: 'Os dois jogadores já tomaram suas decisões no duelo de olhares.',
        see_duel_result: 'Ver resultado do duelo',
        duel_result_title: 'Resultado do duelo',
        continue_game: 'Continuar o jogo',
        duel_both_shot: 'Ambos atiraram!<br>Por sorte, erraram os tiros.',
        duel_both_down: 'Ambos abaixaram as armas.<br>Clima de paz.',
        duel_mixed: 'Uma pessoa atirou e a outra abaixou a arma.<br>Um dos dois foi traiçoeiro.',
        intimidation_title: 'Intimidação bem-sucedida',
        belongs_team: 'O jogador <strong id="intimidated-name">NOME</strong> pertence ao time:',
        belongs_team_online: 'O jogador <strong id="online-intimidated-name">NOME</strong> pertence ao time:',
        understood_hide: 'Entendi, esconder',
        duel_started_you: 'Você iniciou o duelo',
        duel_challenged: 'Você foi desafiado!',
        law_resistance: 'EQUIPE DA LEI',
        outlaw_team: 'FORA DA LEI',

        // ---- Chefe / assassinato ----
        boss_last_chance: 'Última chance do Chefe',
        boss_text: 'Os forasteiros foram escorraçados, mas você pode mudar isso! Tente encontrar o Delegado!',
        assassinate: 'Assassinar',

        // ---- Fim de jogo ----
        game_over: 'Fim de jogo',
        team_law: 'Equipe da Lei',
        team_outlaws: 'Fora-da-Lei',
        play_again: 'Jogar novamente',
        traitor: 'Traíra',
        tag_boss: ' (CHEFE)',
        tag_delegado: ' (DELEGADO)',
        tag_escrivao: ' (ESCRIVÃO)',
        tag_falsificador: ' (FALSIFICADOR)',
        win_outlaw_rejects: 'Vitória dos Fora-da-Lei! 5 equipes seguidas foram rejeitadas pela cidade.',
        win_law_missions: 'Vitória da Lei! A cidade de Red Rock foi salva.',
        win_outlaw_missions: 'Vitória dos Fora-da-Lei! Red Rock sucumbiu.',
        win_boss_shot: 'BANG! O Chefe da Gangue assassinou o Delegado antes de fugir! Vitória dos Fora-da-Lei!',
        win_boss_missed: 'O Chefe atirou na pessoa errada. A cidade executou todos eles! Vitória incontestável da Lei!',

        // ---- Online ----
        nickname_ph: 'Seu apelido...',
        continue_btn: 'Continuar',
        lobby_title: 'Lobby Online',
        join_existing: 'Entrar em sala existente',
        room_code_ph: 'Código da sala',
        enter: 'Entrar',
        or: 'ou',
        create_room: 'Criar nova sala',
        back_modes: 'Voltar aos modos',
        start_match: 'Iniciar partida!',
        waiting_players: 'Aguardando jogadores ({count}/5)',
        leave_room: 'Sair da sala',
        fill_name: 'Preencha seu nome!',
        type_code: 'Digite o código da sala!',
        room_not_found: 'Sala não encontrada!',
        match_started: 'Esta partida já começou!',
        waiting_all: 'Aguardando todos...',
        building_team: '{name} está montando a equipe para a Missão {num}...',
        sheriff_pick_online: 'Você é o Xerife! Monte uma equipe de {size} jogadores.',
        votes_count: '{count}/{total} votaram',
        approve: 'Aprovar',
        reject: 'Rejeitar',
        vote_registered: 'Voto registrado!<br>Aguardando os outros...',
        approved_team: 'Equipe aprovada!',
        rejected_team: 'Equipe rejeitada!',
        approved_list: 'Aprovaram',
        rejected_list: 'Rejeitaram',
        waiting_sheriff_continue: 'Aguardando o xerife continuar...',
        mission_ongoing: 'Missão em andamento',
        secret_decision: 'Sua decisão é secreta. Ninguém saberá o que você escolheu.',
        choice_registered: 'Escolha registrada! Aguardando os outros...',
        waiting_mission_result: 'Aguardando o resultado da missão...',
        next_round: 'Próxima rodada',
        proposed_team: 'Equipe proposta:',
        duel_owner_has_online: '{name} possui o revólver!',
        owner_choosing: 'O dono do revólver está escolhendo um alvo...',
        duel_choose_target: 'Escolha um jogador para duelar:',
        duel_gaze: 'Duelo de olhares',
        secret_choice: 'Sua escolha é SECRETA. Ninguém verá sua decisão.',
        choice_registered_short: 'Escolha registrada!',
        pass_phone: 'Passar o celular',
        waiting_duel_actions: 'Aguardando as ações do duelo...',
        only_you_see: 'Apenas você está vendo isso.',
        boss_last_chance_online: 'Última chance do Chefe!',
        law_won_3: 'A Lei venceu 3 missões... mas o jogo ainda não acabou!',
        you_are_boss: 'Você é o CHEFE DA GANGUE!<br>Tente adivinhar quem é o Delegado:',
        boss_aiming: 'O Chefe da Gangue está mirando no Delegado...',
        waiting_boss: 'Aguardando a decisão do Chefe...',

        // ---- Menu lateral ----
        menu: 'Saloon',
        sound_on: 'Som ativado',
        sound_off: 'Som desativado',
        language: 'Idioma',
        home_screen: 'Tela inicial',

        // ---- Lore das missões ----
        missions_lore: [
            'Missão 1: Escolta da Diligência. O ouro deve chegar intacto.',
            'Missão 2: Defesa do Banco. Há rumores de um assalto pela madrugada.',
            'Missão 3: Investigação no Saloon. Descubra as informações antes que fujam.',
            'Missão 4: Patrulha no Desfiladeiro. Ponto estratégico sendo vigiado.',
            'Missão 5: Defesa Final de Red Rock. Os bandidos estão chegando.'
        ],

        // ---- Tutoriais ----
        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Quem é o verdadeiro informante da Lei? Dois novos personagens entram, e um deles é pura fachada.</p>
                <div class="card">
                    <h2>Os dois novos papéis</h2>
                    <div class="teams"><div class="mini-card"><span class="pip-big"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#1d4ed8" stroke="#1d4ed8" stroke-width="8" stroke-linejoin="round"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#2563eb"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.5" transform="scale(0.86)" transform-origin="50 50"/><g transform="translate(50 50) rotate(42) translate(-50 -50)"><rect x="44" y="26" width="12" height="34" rx="5" fill="#fff"/><rect x="43.5" y="56" width="13" height="3.5" rx="1.5" fill="#1d4ed8"/><path d="M44 60 L56 60 L50 76 Z" fill="#fff"/><path d="M50 62 L50 73" stroke="#1d4ed8" stroke-width="1.8" stroke-linecap="round"/><circle cx="50" cy="63.5" r="1.8" fill="#1d4ed8"/><rect x="45.5" y="22" width="9" height="6" rx="2.5" fill="#1d4ed8"/></g></svg></span><span class="nome">Escrivão</span><span class="meta">Da Lei. Vê dois nomes, mas não sabe qual é o Delegado de verdade.</span></div><div class="mini-card red"><span class="pip-big"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#b91c1c" stroke="#b91c1c" stroke-width="8" stroke-linejoin="round"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#dc2626"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.5" transform="scale(0.86)" transform-origin="50 50"/><g transform="translate(50 49) scale(0.5) translate(-50 -50)"><path d="M50 10 C27 10 15 26 15 44 C15 56 21 63 28 67 L28 78 Q28 85 35 85 L65 85 Q72 85 72 78 L72 67 C79 63 85 56 85 44 C85 26 73 10 50 10 Z" fill="#fff"/><ellipse cx="36.5" cy="46" rx="10" ry="12" fill="#b91c1c"/><ellipse cx="63.5" cy="46" rx="10" ry="12" fill="#b91c1c"/><path d="M50 58 L43 70 Q50 74 57 70 Z" fill="#b91c1c"/></g></svg></span><span class="nome">Falsificador</span><span class="meta">Fora-da-lei. Finge ser a autoridade para enganar o Escrivão.</span></div></div>
                    <p>Esta expansão <strong>exige o Delegado e o Chefe</strong> (Distintivo).</p>
                </div>
                <div class="card">
                    <h2>O dilema do Escrivão</h2>
                    <p>O Escrivão vê <strong>dois nomes</strong>: um é o <strong>Delegado</strong> verdadeiro, o outro é o <strong>Falsificador</strong> disfarçado. Mas <strong>não sabe qual é qual</strong> e precisa deduzir em quem confiar.</p>
                </div>
                <div class="card">
                    <h2>O disfarce do Falsificador</h2>
                    <p>É um <strong>fora-da-lei comum</strong>: conhece os outros bandidos e <strong>pode sabotar</strong>. O <strong>Delegado não o enxerga</strong>, então ele blefa livremente. No <strong>duelo</strong>, aparece como time da <strong>Lei</strong>.</p>
                    <div class="alerta"><span class="bang">!</span><span>Com a Farsante ativa, o Delegado passa a <strong>ver o Chefe</strong>, e quem some da visão dele é o <strong>Falsificador</strong>. Os dois são sempre pessoas diferentes.</span></div>
                </div>`,
            PARTY: `
                <p class="tut-sub">Transforme uma TV ou notebook na mesa de jogo. Perfeito para jogar todos juntos na mesma sala.</p>
                <div class="card">
                    <h2>Como funciona</h2>
                    <p>Quem liga o <strong>Modo Party</strong> vira a <strong>tela</strong>: o aparelho mostra o tabuleiro, as votações e os resultados para todos verem. Quem é a tela <strong>não joga</strong>.</p>
                </div>
                <div class="card">
                    <h2>Os jogadores</h2>
                    <p>Cada jogador entra pelo <strong>próprio celular</strong> (pelo código ou QR code) e usa o telefone como controle: vota, cumpre missões e participa dos duelos. Fora da sua vez, o celular mostra um resumo dos papéis em jogo.</p>
                </div>
                <div class="card">
                    <h2>Cronômetros</h2>
                    <p>No Modo Party, a votação tem <strong>1 minuto</strong> (aprova sozinha se o tempo acabar) e o Xerife tem <strong>1min30</strong> para montar a equipe (passa a vez se demorar). Isso mantém o ritmo da festa.</p>
                </div>
            `,
            PARTY: `
                <p class="tut-sub">Turn a TV or laptop into the game table. Perfect for playing together in the same room.</p>
                <div class="card">
                    <h2>How it works</h2>
                    <p>Whoever turns on <strong>Party Mode</strong> becomes the <strong>screen</strong>: the device shows the board, votes and results for everyone to see. The screen <strong>does not play</strong>.</p>
                </div>
                <div class="card">
                    <h2>The players</h2>
                    <p>Each player joins from their <strong>own phone</strong> (by code or QR) and uses it as a controller: voting, running missions and dueling. When it is not their turn, the phone shows a summary of the roles in play.</p>
                </div>
                <div class="card">
                    <h2>Timers</h2>
                    <p>In Party Mode, voting lasts <strong>1 minute</strong> (auto-approves on timeout) and the Sheriff has <strong>1m30</strong> to pick the team (turn passes on timeout). This keeps the party flowing.</p>
                </div>
            `,
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> é um jogo de dedução social para 5 a 10 jogadores. Confie em quem merece.</p>
                <div class="card">
                    <h2>Dois times, uma cidade</h2>
                    <p>No início, cada jogador recebe uma carta <strong>secreta</strong> que define seu time. Ninguém mais pode vê-la.</p>
                    <div class="teams"><div class="mini-card"><span class="pip-corner">♠<br>L</span><span class="pip-big">♠</span><span class="nome">Equipe da Lei</span><span class="meta">A maioria. Não sabe quem é quem — precisa deduzir.</span><span class="pip-corner b">♠<br>L</span></div><div class="mini-card red"><span class="pip-corner">♦<br>F</span><span class="pip-big">♦</span><span class="nome">Fora da Lei</span><span class="meta">A minoria infiltrada. Eles se conhecem entre si.</span><span class="pip-corner b">♦<br>F</span></div></div>
                    <p>A Lei vence cumprindo missões. Os Fora-da-Lei vencem sabotando sem serem descobertos.</p>
                </div>
                <div class="card">
                    <h2>Objetivo: 3 fichas</h2>
                    <p>A partida tem até <strong>5 missões</strong>. Quem cravar <strong>3 fichas</strong> primeiro, vence.</p>
                    <div class="chips-row">
                        <div class="chip blue"><span>2</span></div>
                        <div class="chip blue"><span>3</span></div>
                        <div class="chip red"><span>2</span></div>
                        <div class="chip"><span>3</span></div>
                        <div class="chip"><span>3</span></div>
                    </div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>missão cumprida</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>missão sabotada</i>
                    </div>
                    <p style="margin-top:10px">O número na ficha indica quantos jogadores vão para aquela missão.</p>
                </div>
                <div class="card">
                    <h2>A rodada, passo a passo</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z" fill="#ffde59" stroke="#881337" stroke-width="1.6" stroke-linejoin="round"/></svg> O Xerife monta a equipe</h3><p>Um jogador é o <strong>Xerife</strong> da rodada. Ele escolhe quem vai para a missão (o número na ficha). O cargo gira a cada rodada.</p></div><div class="passo"><div class="num"><span>2</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M7 11l3-7c1.4 0 2 .9 2 2l-.4 3H17c1.1 0 2 .9 2 2l-1.2 6c-.2 1-1 2-2.2 2H8z" fill="#fff" stroke="#2563eb" stroke-width="1.7" stroke-linejoin="round"/><rect x="3" y="11" width="4" height="9" rx="1" fill="#60a5fa" stroke="#2563eb" stroke-width="1.5"/></svg> Todos votam na equipe</h3><p><strong>Todo mundo</strong> vota sim ou não — inclusive quem ficou de fora. Maioria simples aprova e a missão começa.</p><p>Rejeitou? O Xerife passa para o próximo jogador, que propõe outra equipe.</p></div><div class="passo"><div class="num"><span>3</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 9c2.5-2 6-2.6 9-2.6S18.5 7 21 9c0 4-2.5 7.5-5 7.5-1.3 0-1.8-1-4-1s-2.7 1-4 1C5.5 16.5 3 13 3 9z" fill="#fff" stroke="#881337" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.5" cy="11" r="1.4" fill="#881337"/><circle cx="15.5" cy="11" r="1.4" fill="#881337"/></svg> A missão é secreta</h3><p>Cada escolhido decide no celular, escondido: <strong>cumprir</strong> ou <strong>sabotar</strong>.</p><p>Quem é da Lei <strong>só pode cumprir</strong>. O Fora-da-Lei escolhe — sabotar avança o time dele, mas levanta suspeita.</p></div><div class="passo"><div class="num"><span>4</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#881337" stroke-width="1.7"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#881337" stroke-width="1.3" stroke-dasharray="2.5 2.5"/><path d="M9.5 12.2l1.8 1.8 3.4-3.8" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> O resultado vira ficha</h3><p>Os votos da missão são revelados juntos, sem dizer de quem foram. <strong>Uma única sabotagem</strong> já derruba a missão — e a ficha fica vermelha.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 equipes rejeitadas em sequência</strong> = a cidade entrou em colapso. Vitória imediata dos Fora-da-Lei. Não deixem a votação travar!</span></div>
                    <div class="nota">Em mesas grandes, algumas missões exigem <strong>2 sabotagens</strong> para falhar — a ficha avisa com "2 falhas".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Delegado e Chefe</h2>
                    <p>Dois personagens especiais entram no baralho — um para cada time.</p>
                    <div class="teams"><div class="mini-card"><span class="pip-corner">♣<br>D</span><span class="pip-big">♣</span><span class="nome">Delegado</span><span class="meta">Da Lei. Começa sabendo quem é Fora-da-Lei — mas não pode se entregar.</span><span class="pip-corner b">♣<br>D</span></div><div class="mini-card red"><span class="pip-corner">♥<br>C</span><span class="pip-big">♥</span><span class="nome">Chefe da Gangue</span><span class="meta">O único bandido que o Delegado NÃO conhece.</span><span class="pip-corner b">♥<br>C</span></div></div>
                    <p>O Delegado precisa usar o que sabe com <strong>cautela</strong>: se agir na cara, vira alvo.</p>
                    <div class="alerta"><span class="bang">!</span><span>Se a Lei vencer as 3 missões, o Chefe tem <strong>uma última bala</strong>: tentar adivinhar quem é o Delegado. Se acertar, os Fora-da-Lei <strong>roubam a vitória</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 8h13l4-2v4l-2.5.8L16 13l-1.5 5h-3l1-4.5H8.5L7 17H4l1.6-5.8L3 10z" fill="#fff" stroke="#881337" stroke-width="1.6" stroke-linejoin="round"/></svg> Revólver e duelo</h2>
                    <p>Um jogador começa com o <strong>revólver</strong>. Após as missões 2 e 3, ele pode desafiar alguém para um <strong>duelo de olhares</strong> (ou pular).</p>
                    <p>No duelo, os dois escolhem em segredo: <strong>atirar</strong> ou <strong>abaixar a arma</strong>.</p>
                    <div class="nota">Se os dois escolherem o <strong>mesmo</strong>, o dono do revólver descobre o <strong>time</strong> do oponente — em sigilo. Se escolherem diferente, só a tensão fica no ar.</div>
                    <p style="margin-top:10px">Depois do duelo, o revólver passa para o desafiado (sem devolução imediata).</p>
                </div>`
        }
    },

    en: {
        tap_start: 'Tap to enter the saloon',
        choose_mode: 'Pick your table',
        mode_offline: 'Pass & Play (Offline)',
        mode_online: 'Play Online',

        setup_title: 'Write down the players<br>in seating order:',
        name_ph: 'Player name',
        next: 'Next',
        how_to_play: 'How to play',
        back_menu: 'Back to menu',
        back: 'Back',
        extras_title: 'Extra characters',
        extra_roles: 'Badge',
        extra_roles_sub: 'Marshal and Gang Boss',
        extra_roles_inline: 'Badge',
        extra_revolver: 'Duel',
        extra_revolver_sub: 'Loaded revolver',
        extra_farsante: 'Farce',
        extra_farsante_sub: 'Clerk and Forger',
        farsante_req: 'Requires Badge',
        party_mode_title: 'Party Mode',
        party_mode_sub: 'This device becomes the screen. Players join from their phones.',
        screen_join_title: 'Join from your phone',
        screen_join_sub: 'Open Saloon, choose "Join room" and enter the code above.',
        screen_join_sub_qr: 'Scan the QR code or join with the room code.',
        screen_scan_to_join: 'Point your camera',
        screen_dealing_title: 'Dealing the cards',
        screen_dealing_sub: 'Everyone is checking their cards...',
        screen_dealing_comp: 'Today in Red Rock we have',
        dealing_side_law: 'The Law',
        dealing_side_outlaw: 'Outlaws',
        screen_track: 'Track',
        screen_sheriff_picks: '{name} picks a team of {size} agents.',
        rejected_teams_short: 'Rejections',
        screen_mission_label: 'Mission',
        screen_sheriff_label: 'Sheriff',
        screen_vote_title: 'Team Vote',
        screen_vote_sub: 'The table decides: does this team go to Mission {num}?',
        screen_of: 'of',
        screen_voted: 'voted',
        proposed_team: 'Proposed Team',
        screen_mission_title: 'Mission Underway',
        screen_mission_sub: 'The agents rode off to Red Rock...',
        screen_mission_dust: 'THE DESERT WATCHES IN SILENCE',
        screen_agents_decided: 'agents decided',
        mission_success: 'Mission Accomplished!',
        mission_failed: 'Mission Sabotaged!',
        one_sabotage: 'sabotage',
        n_sabotages: 'sabotages',
        vote_yes_label: 'Approved',
        vote_no_label: 'Rejected',
        screen_vote_timeout: 'Time is up! The team was approved automatically.',
        law_wins: 'The Law Wins!',
        outlaw_wins: 'The Outlaws Win!',
        screen_boss_title: 'The Last Bullet',
        screen_boss_sub: 'The Gang Boss tries to guess who the Marshal is...',
        screen_boss_dust: 'ONE SHOT. ONE CHANCE.',
        screen_new_game: 'New Game',
        phone_watch_screen_result: 'The result and roles were revealed on the big screen!',
        phone_boss_aiming_title: 'The Boss is aiming',
        phone_boss_aiming_sub: 'Watch the big screen for the last bullet outcome.',
        screen_duel_title: 'Duel Time',
        screen_duel_choose_sub: '{name} has the revolver and chooses who to challenge...',
        screen_duel_dust: 'THE DUST SETTLES OVER RED ROCK',
        screen_duel_faceoff_title: 'Face to Face',
        screen_duel_faceoff_sub: 'Shoot or back down? Both decide in secret...',
        screen_duel_done: 'The Duel Is Over',
        screen_duel_resolved: 'SECRETS WERE REVEALED IN THE SHOWDOWN',
        phone_duel_title: 'Duel Time',
        phone_duel_sub: 'Watch the duel on the big screen.',
        screen_start: 'Start the match',
        screen_need_players: 'Waiting for players (minimum 5)',
        screen_need_players_count: 'Waiting for players: {count}/5',
        phone_summary_eyebrow: 'The Red Rock table',
        phone_watch_hint: 'Follow on the big screen. Your phone alerts you when it is your turn.',
        phone_review_card: 'Review my card',
        phone_back_summary: 'Back',
        phone_desc_law: 'Help the Sheriff complete missions and find the infiltrated outlaws.',
        phone_desc_delegado: 'You know the outlaws from the start, but act carefully so you are not exposed.',
        phone_desc_escrivao: 'You see two names: the real Marshal and the Forger. Figure out who to trust.',
        phone_desc_outlaw: 'Sabotage missions without being noticed and lead the gang to victory.',
        phone_desc_boss: 'Leads the gang. If the Law wins 3 missions, tries to guess the Marshal to steal the win.',
        phone_desc_falsificador: 'An outlaw posing as the authority. Appears as a possible Marshal and looks like the Law in the duel.',
        extra_revolver_inline: 'Duel',
        extra_farsante_inline: 'Farce',
        confirm: 'Open the table!',
        min_players: 'At least 5 players are needed to start.',
        max_players: 'Maximum of 10 players reached.',
        name_exists: 'Name already exists.',
        close: 'Close',

        pass_to: 'Pass the phone to',
        confidential_to: 'Confidential reveal for',
        are_you: 'Are you <b>{name}</b>?',
        yes_me: "Yes, that's me",
        not_me: 'No',
        pass_hint: 'Then hand the phone to {name}.',
        no_peeking: 'Make sure nobody else is watching.',

        your_identity: 'Your identity',
        view_card: 'Peek at the card',
        flip_card: 'Flip the card',
        hide_card: 'Hide it and pass along',
        understood: 'Got it',
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
        falsificador_desc2: 'But poses as the authority.',
        falsificador_notice: 'You appear as a possible <b>Marshal</b> to the Clerk. In the duel, you look like the <b>Law</b>.',
        law_desc1: 'Help the Sheriff on missions and find out who the outlaws are.',
        law_desc2: 'You must complete every mission you join.',
        outlaw_desc1: 'You are undercover in town.',
        outlaw_desc2: 'Sabotage (or not) the missions without being noticed.',
        boss_desc2: 'Sabotage (or not) the missions without being noticed, and find the marshal.',

        rejected_teams: 'Rejected teams:',
        current_sheriff: 'Sheriff this round:',
        sheriff_must: 'The sheriff builds a team of <strong id="mission-size-req" class="neon-text">X</strong> players for Mission <span id="current-mission-num">1</span>.',
        select_team: 'Select the team:',
        propose_team: 'Propose team',
        waiting_sheriff: 'Waiting for the Sheriff to propose a team...',
        start_voting: 'Start the vote',
        two_fails: '2 sabotages',
        mission_n: 'Mission',

        team_vote_title: 'Team vote',
        proposed_by: 'Team proposed by',
        voting_rules: '<p><strong>The vote happens as a group, right now!</strong> Everyone votes at once with eyes closed (thumbs up = approve, thumbs down = reject).</p><p>The mission needs at least <strong id="majority-number" class="neon-text yellow">X</strong> approval votes to go ahead.</p>',
        vote_yes_group: 'Majority APPROVED',
        vote_no_group: 'Majority REJECTED',

        mission_exec: 'Run the mission',
        mission_do: 'COMPLETE mission',
        chip_cumprir: 'Complete',
        chip_sabotar: 'Sabotage',
        mission_sabotage: 'SABOTAGE mission',
        law_only: 'Law members can ONLY complete.',
        mission_done_title: 'Mission concluded',
        mission_done_p: 'The team made their choices in secret.',
        mission_done_q: 'What could have happened out in the Red Rock desert?',
        reveal_mission: 'Reveal the outcome',
        mission_result_title: 'Mission outcome',
        mission_chips_sub: 'One chip per team member:',
        sabotages: 'Sabotages:',
        next_phase: 'Next phase',
        mission_success_t: 'Mission accomplished!',
        mission_fail_t: 'Mission sabotaged!',
        mission_success_lore: 'The Red Rock operation was a success.',
        mission_fail_lore: 'There were infiltrators on the team and the operation failed!',

        duel_time: 'Time to duel',
        duel_owner_has: '{name} holds the revolver.',
        duel_choose: 'You hold the revolver. Pick someone to duel:',
        challenge: 'Challenge',
        skip_duel: 'Skip the duel',
        duel_actions: 'Your move',
        duel_hold: 'Stand your ground. How do you react in this duel?',
        shoot: 'SHOOT',
        lower_gun: 'LOWER YOUR GUN',
        dust_settling: 'The dust is settling...',
        duel_decided: 'Both players have made their choices in the staredown.',
        see_duel_result: 'See the duel outcome',
        duel_result_title: 'Duel outcome',
        continue_game: 'Continue the game',
        duel_both_shot: 'Both fired!<br>Luckily, both missed.',
        duel_both_down: 'Both lowered their guns.<br>Peace, for now.',
        duel_mixed: 'One fired and the other lowered their gun.<br>One of them played dirty.',
        intimidation_title: 'Successful intimidation',
        belongs_team: 'Player <strong id="intimidated-name">NAME</strong> belongs to:',
        belongs_team_online: 'Player <strong id="online-intimidated-name">NAME</strong> belongs to:',
        understood_hide: 'Got it, hide',
        duel_started_you: 'You started the duel',
        duel_challenged: 'You were challenged!',
        law_resistance: 'THE LAW',
        outlaw_team: 'OUTLAW',

        boss_last_chance: "The Boss's last chance",
        boss_text: 'The outsiders were run out of town, but you can change that! Try to find the Marshal!',
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

        nickname_ph: 'Your nickname...',
        continue_btn: 'Continue',
        lobby_title: 'Online Lobby',
        join_existing: 'Join an existing room',
        room_code_ph: 'Room code',
        enter: 'Join',
        or: 'or',
        create_room: 'Create new room',
        back_modes: 'Back to modes',
        start_match: 'Start the game!',
        waiting_players: 'Waiting for players ({count}/5)',
        leave_room: 'Leave room',
        fill_name: 'Enter your name!',
        type_code: 'Enter the room code!',
        room_not_found: 'Room not found!',
        match_started: 'This game has already started!',
        waiting_all: 'Waiting for everyone...',
        building_team: '{name} is building the team for Mission {num}...',
        sheriff_pick_online: 'You are the Sheriff! Assemble a team of {size} players.',
        votes_count: '{count}/{total} voted',
        approve: 'Approve',
        reject: 'Reject',
        vote_registered: 'Vote registered!<br>Waiting for the others...',
        approved_team: 'Team approved!',
        rejected_team: 'Team rejected!',
        approved_list: 'Approved',
        rejected_list: 'Rejected',
        waiting_sheriff_continue: 'Waiting for the sheriff to continue...',
        mission_ongoing: 'Mission in progress',
        secret_decision: 'Your decision is secret. Nobody will know what you chose.',
        choice_registered: 'Choice registered! Waiting for the others...',
        waiting_mission_result: 'Waiting for the mission outcome...',
        next_round: 'Next round',
        proposed_team: 'Proposed team:',
        duel_owner_has_online: '{name} holds the revolver!',
        owner_choosing: 'The revolver owner is picking a target...',
        duel_choose_target: 'Pick a player to duel:',
        duel_gaze: 'Staredown duel',
        secret_choice: 'Your choice is SECRET. Nobody will see your decision.',
        choice_registered_short: 'Choice registered!',
        pass_phone: 'Pass the phone',
        waiting_duel_actions: 'Waiting for the duel actions...',
        only_you_see: 'Only you can see this.',
        boss_last_chance_online: "The Boss's last chance!",
        law_won_3: "The Law won 3 missions... but it's not over yet!",
        you_are_boss: 'You are the GANG BOSS!<br>Try to guess who the Marshal is:',
        boss_aiming: 'The Gang Boss is taking aim at the Marshal...',
        waiting_boss: "Waiting for the Boss's decision...",

        menu: 'Saloon',
        sound_on: 'Sound on',
        sound_off: 'Sound off',
        language: 'Language',
        home_screen: 'Home screen',

        missions_lore: [
            'Mission 1: Stagecoach Escort. The gold must arrive untouched.',
            'Mission 2: Bank Defense. Rumors of a heist before dawn.',
            'Mission 3: Saloon Investigation. Get the intel before they flee.',
            'Mission 4: Canyon Patrol. A strategic point is being watched.',
            'Mission 5: Final Defense of Red Rock. The bandits are coming.'
        ],

        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Who is the Law real informant? Two new characters join, and one is pure facade.</p>
                <div class="card">
                    <h2>The two new roles</h2>
                    <div class="teams"><div class="mini-card"><span class="pip-big"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#1d4ed8" stroke="#1d4ed8" stroke-width="8" stroke-linejoin="round"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#2563eb"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.5" transform="scale(0.86)" transform-origin="50 50"/><g transform="translate(50 50) rotate(42) translate(-50 -50)"><rect x="44" y="26" width="12" height="34" rx="5" fill="#fff"/><rect x="43.5" y="56" width="13" height="3.5" rx="1.5" fill="#1d4ed8"/><path d="M44 60 L56 60 L50 76 Z" fill="#fff"/><path d="M50 62 L50 73" stroke="#1d4ed8" stroke-width="1.8" stroke-linecap="round"/><circle cx="50" cy="63.5" r="1.8" fill="#1d4ed8"/><rect x="45.5" y="22" width="9" height="6" rx="2.5" fill="#1d4ed8"/></g></svg></span><span class="nome">Clerk</span><span class="meta">Law side. Sees two names, but does not know which is the real Marshal.</span></div><div class="mini-card red"><span class="pip-big"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#b91c1c" stroke="#b91c1c" stroke-width="8" stroke-linejoin="round"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="#dc2626"/><path d="M22 16 L78 16 Q82 16 82 22 L82 50 Q82 74 50 88 Q18 74 18 50 L18 22 Q18 16 22 16 Z" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" opacity="0.5" transform="scale(0.86)" transform-origin="50 50"/><g transform="translate(50 49) scale(0.5) translate(-50 -50)"><path d="M50 10 C27 10 15 26 15 44 C15 56 21 63 28 67 L28 78 Q28 85 35 85 L65 85 Q72 85 72 78 L72 67 C79 63 85 56 85 44 C85 26 73 10 50 10 Z" fill="#fff"/><ellipse cx="36.5" cy="46" rx="10" ry="12" fill="#b91c1c"/><ellipse cx="63.5" cy="46" rx="10" ry="12" fill="#b91c1c"/><path d="M50 58 L43 70 Q50 74 57 70 Z" fill="#b91c1c"/></g></svg></span><span class="nome">Forger</span><span class="meta">Outlaw. Poses as the authority to fool the Clerk.</span></div></div>
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
                    <div class="teams"><div class="mini-card"><span class="pip-corner">♠<br>L</span><span class="pip-big">♠</span><span class="nome">The Law</span><span class="meta">The majority. They don't know who's who — they must deduce.</span><span class="pip-corner b">♠<br>L</span></div><div class="mini-card red"><span class="pip-corner">♦<br>O</span><span class="pip-big">♦</span><span class="nome">Outlaws</span><span class="meta">The hidden minority. They know each other.</span><span class="pip-corner b">♦<br>O</span></div></div>
                    <p>The Law wins by completing missions. The Outlaws win by sabotaging without getting caught.</p>
                </div>
                <div class="card">
                    <h2>Goal: 3 chips</h2>
                    <p>A match has up to <strong>5 missions</strong>. First side to claim <strong>3 chips</strong> wins.</p>
                    <div class="chips-row">
                        <div class="chip blue"><span>2</span></div>
                        <div class="chip blue"><span>3</span></div>
                        <div class="chip red"><span>2</span></div>
                        <div class="chip"><span>3</span></div>
                        <div class="chip"><span>3</span></div>
                    </div>
                    <div class="chip-legenda">
                        <i><span class="dot" style="background:var(--law)"></span>mission completed</i>
                        <i><span class="dot" style="background:var(--outlaw)"></span>mission sabotaged</i>
                    </div>
                    <p style="margin-top:10px">The number on the chip shows how many players go on that mission.</p>
                </div>
                <div class="card">
                    <h2>The round, step by step</h2>
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8z" fill="#ffde59" stroke="#881337" stroke-width="1.6" stroke-linejoin="round"/></svg> The Sheriff picks a team</h3><p>One player is the round's <strong>Sheriff</strong>. They choose who goes on the mission (the number on the chip). The badge rotates every round.</p></div><div class="passo"><div class="num"><span>2</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M7 11l3-7c1.4 0 2 .9 2 2l-.4 3H17c1.1 0 2 .9 2 2l-1.2 6c-.2 1-1 2-2.2 2H8z" fill="#fff" stroke="#2563eb" stroke-width="1.7" stroke-linejoin="round"/><rect x="3" y="11" width="4" height="9" rx="1" fill="#60a5fa" stroke="#2563eb" stroke-width="1.5"/></svg> Everyone votes on the team</h3><p><strong>Everyone</strong> votes yes or no — including players left out. A simple majority approves and the mission starts.</p><p>Rejected? The badge passes to the next player, who proposes another team.</p></div><div class="passo"><div class="num"><span>3</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><path d="M3 9c2.5-2 6-2.6 9-2.6S18.5 7 21 9c0 4-2.5 7.5-5 7.5-1.3 0-1.8-1-4-1s-2.7 1-4 1C5.5 16.5 3 13 3 9z" fill="#fff" stroke="#881337" stroke-width="1.7" stroke-linejoin="round"/><circle cx="8.5" cy="11" r="1.4" fill="#881337"/><circle cx="15.5" cy="11" r="1.4" fill="#881337"/></svg> The mission is secret</h3><p>Each chosen player decides on the phone, hidden: <strong>complete</strong> or <strong>sabotage</strong>.</p><p>Law members <strong>can only complete</strong>. Outlaws choose — sabotaging helps their side, but raises suspicion.</p></div><div class="passo"><div class="num"><span>4</span></div><h3><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" stroke="#881337" stroke-width="1.7"/><circle cx="12" cy="12" r="5.2" fill="none" stroke="#881337" stroke-width="1.3" stroke-dasharray="2.5 2.5"/><path d="M9.5 12.2l1.8 1.8 3.4-3.8" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> The result claims a chip</h3><p>The mission votes are revealed together, without naming anyone. <strong>A single sabotage</strong> fails the mission — and the chip turns red.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 rejected teams in a row</strong> = the town collapses. Instant Outlaw victory. Don't let the vote stall!</span></div>
                    <div class="nota">On bigger tables, some missions need <strong>2 sabotages</strong> to fail — the chip is marked "2 fails".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Marshal and Boss</h2>
                    <p>Two special characters join the deck — one for each team.</p>
                    <div class="teams"><div class="mini-card"><span class="pip-corner">♣<br>M</span><span class="pip-big">♣</span><span class="nome">Marshal</span><span class="meta">On the Law. Starts knowing who the Outlaws are — but must not give it away.</span><span class="pip-corner b">♣<br>M</span></div><div class="mini-card red"><span class="pip-corner">♥<br>B</span><span class="pip-big">♥</span><span class="nome">Gang Boss</span><span class="meta">The only outlaw the Marshal does NOT know.</span><span class="pip-corner b">♥<br>B</span></div></div>
                    <p>The Marshal must use that knowledge with <strong>care</strong>: act too openly and they become a target.</p>
                    <div class="alerta"><span class="bang">!</span><span>If the Law wins 3 missions, the Boss gets <strong>one last bullet</strong>: guess who the Marshal is. A hit means the Outlaws <strong>steal the victory</strong>.</span></div>
                </div>`,
            REVOLVER: `
                <div class="card">
                    <h2><svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 8h13l4-2v4l-2.5.8L16 13l-1.5 5h-3l1-4.5H8.5L7 17H4l1.6-5.8L3 10z" fill="#fff" stroke="#881337" stroke-width="1.6" stroke-linejoin="round"/></svg> Revolver and duel</h2>
                    <p>One player starts with the <strong>revolver</strong>. After missions 2 and 3, they may challenge someone to a <strong>staring duel</strong> (or skip).</p>
                    <p>In the duel, both secretly choose: <strong>shoot</strong> or <strong>lower your gun</strong>.</p>
                    <div class="nota">If both pick the <strong>same</strong>, the revolver owner learns the opponent's <strong>team</strong> — in secret. If they differ, only the tension lingers.</div>
                    <p style="margin-top:10px">After the duel, the revolver passes to the challenged player (no immediate return).</p>
                </div>`
        }
    }
};

// ── Estado do idioma ─────────────────────────
let LANG = localStorage.getItem('saloon_lang') || 'pt';
if (!I18N[LANG]) LANG = 'pt';

function t(key, vars) {
    let str = I18N[LANG][key];
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
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
    applyLanguage();
}

// Aplica as traduções nos elementos estáticos do HTML
function applyLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // Destaca o idioma ativo no menu
    document.querySelectorAll('.lang-opt').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === LANG);
    });

    // Botão de som depende do estado do AudioManager
    const sndBtn = document.getElementById('menu-sound-btn');
    if (sndBtn && typeof AudioManager !== 'undefined') {
        sndBtn.innerText = (AudioManager.isMuted ? '🔇 ' + t('sound_off') : '🔊 ' + t('sound_on'));
    }
}
