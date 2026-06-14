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
        extra_roles: 'Delegado e<br>Chefe da Gangue',
        extra_roles_inline: 'Delegado e Chefe',
        extra_revolver: 'Revólver<br>Carregado',
        extra_revolver_inline: 'Revólver Carregado',
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
        extra_roles: 'Marshal and<br>Gang Boss',
        extra_roles_inline: 'Marshal and Boss',
        extra_revolver: 'Loaded<br>Revolver',
        extra_revolver_inline: 'Loaded Revolver',
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
