// ════════════════════════════════════════════
// SALOON — i18n (PT padrão / EN no menu lateral)
// ════════════════════════════════════════════

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
        sheriff_must: 'O xerife precisa montar uma equipe de <strong id="mission-size-req" class="neon-text">X</strong> jogadores para a Missão <span id="current-mission-num">1</span>.',
        select_team: 'Selecione a equipe:',
        propose_team: 'Propor equipe',
        two_fails: '2 sabotagens',

        // ---- Votação (offline) ----
        team_vote_title: 'Votação da equipe',
        proposed_by: 'Equipe proposta por',
        voting_rules: '<p><strong>A votação é feita em grupo, agora!</strong> Todos votam ao mesmo tempo de olhos fechados (polegar para cima = aprovar, para baixo = rejeitar).</p><p>Para a missão sair, são necessários pelo menos <strong id="majority-number" class="neon-text yellow">X</strong> votos de aprovação.</p>',
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
        mission_fail_lore: 'Havia infiltrados na equipe e a operação falhou!',

        // ---- Duelo ----
        duel_time: 'Hora do duelo',
        duel_owner_has: '{name} possui o revólver.',
        duel_choose: 'Você possui o revólver. Escolha alguém para duelar:',
        challenge: 'Desafiar',
        skip_duel: 'Pular duelo',
        duel_hold: 'Mantenha-se firme. Como você reage neste duelo?',
        shoot: 'ATIRAR',
        lower_gun: 'ABAIXAR A ARMA',
        dust_settling: 'A poeira está baixando...',
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

        // ---- Sigilo da ficha ----
        secret_choice: 'Sua escolha é SECRETA. Ninguém verá sua decisão.',
        choice_registered_short: 'Escolha registrada!',
        pass_phone: 'Passar o celular',

        // ---- Menu lateral ----
        menu: 'Saloon',
        sound_on: 'Som ativado',
        sound_off: 'Som desativado',
        language: 'Idioma',
        home_screen: 'Tela inicial',

        // ---- Tutoriais ----
        tutorials: {
            FARSANTE: `
                <p class="tut-sub">Quem é o verdadeiro informante da Lei? Dois novos personagens entram, e um deles é pura fachada.</p>
                <div class="card">
                    <h2>Os dois novos papéis</h2>
                    <div class="teams"><div class="mini-card" data-papel="ESCRIVAO"><span class="nome">Escrivão</span><span class="meta">Da Lei. Vê dois nomes, mas não sabe qual é o Delegado.</span></div><div class="mini-card" data-papel="FALSIFICADOR"><span class="nome">Falsificador</span><span class="meta">Fora-da-lei. Finge ser a autoridade.</span></div></div>
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
            GENERAL: `
                <p class="tut-sub"><strong>Saloon</strong> é um jogo de dedução social para 5 a 10 jogadores. Confie em quem merece.</p>
                <div class="card">
                    <h2>Dois times, uma cidade</h2>
                    <p>No início, cada jogador recebe uma carta <strong>secreta</strong> que define seu time. Ninguém mais pode vê-la.</p>
                    <div class="teams"><div class="mini-card" data-papel="LAW"><span class="nome">Equipe da Lei</span><span class="meta">A maioria. Não sabe quem é quem.</span></div><div class="mini-card" data-papel="OUTLAW"><span class="nome">Fora da Lei</span><span class="meta">A minoria infiltrada. Eles se conhecem entre si.</span></div></div>
                    <p>A Lei vence cumprindo missões. Os Fora-da-Lei vencem sabotando sem serem descobertos.</p>
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
                    <div class="trilha"><div class="passo"><div class="num"><span>1</span></div><h3>O Xerife monta a equipe</h3><p>Um jogador é o <strong>Xerife</strong> da rodada. Ele escolhe quem vai para a missão (o número na ficha). O cargo gira a cada rodada.</p></div><div class="passo"><div class="num"><span>2</span></div><h3>Todos votam na equipe</h3><p><strong>Todo mundo</strong> vota sim ou não — inclusive quem ficou de fora. Maioria simples aprova e a missão começa.</p><p>Rejeitou? O Xerife passa para o próximo jogador, que propõe outra equipe.</p></div><div class="passo"><div class="num"><span>3</span></div><h3>A missão é secreta</h3><p>Cada escolhido decide no celular, escondido: <strong>cumprir</strong> ou <strong>sabotar</strong>.</p><p>Quem é da Lei <strong>só pode cumprir</strong>. O Fora-da-Lei escolhe — sabotar avança o time dele, mas levanta suspeita.</p></div><div class="passo"><div class="num"><span>4</span></div><h3>O resultado vira ficha</h3><p>Os votos da missão são revelados juntos, sem dizer de quem foram. <strong>Uma única sabotagem</strong> já derruba a missão — e a ficha fica vermelha.</p></div></div>
                    <div class="alerta"><span class="bang">!</span><span><strong>5 equipes rejeitadas em sequência</strong> = a cidade entrou em colapso. Vitória imediata dos Fora-da-Lei. Não deixem a votação travar!</span></div>
                    <div class="nota">Em mesas grandes, algumas missões exigem <strong>2 sabotagens</strong> para falhar — a ficha avisa com "2 sabotagens".</div>
                </div>`,
            DELEGADO: `
                <div class="card">
                    <h2>Delegado e Chefe</h2>
                    <p>Dois personagens especiais entram no baralho — um para cada time.</p>
                    <div class="teams"><div class="mini-card" data-papel="DELEGADO"><span class="nome">Delegado</span><span class="meta">Da Lei. Começa sabendo quem é Fora-da-Lei.</span></div><div class="mini-card" data-papel="BOSS"><span class="nome">Chefe da Gangue</span><span class="meta">O único bandido que o Delegado NÃO conhece.</span></div></div>
                    <p>O Delegado precisa usar o que sabe com <strong>cautela</strong>: se agir na cara, vira alvo.</p>
                    <div class="alerta"><span class="bang">!</span><span>Se a Lei vencer as 3 missões, o Chefe tem <strong>uma última bala</strong>: tentar adivinhar quem é o Delegado. Se acertar, os Fora-da-Lei <strong>roubam a vitória</strong>.</span></div>
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
        falsificador_desc2: 'But poses as the authority.',
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
        voting_rules: '<p><strong>The vote happens as a group, right now!</strong> Everyone votes at once with eyes closed (thumbs up = approve, thumbs down = reject).</p><p>The mission needs at least <strong id="majority-number" class="neon-text yellow">X</strong> approval votes to go ahead.</p>',
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
        mission_fail_lore: 'There were infiltrators on the team and the operation failed!',

        duel_time: 'Time to duel',
        duel_owner_has: '{name} holds the revolver.',
        duel_choose: 'You hold the revolver. Pick someone to duel:',
        challenge: 'Challenge',
        skip_duel: 'Skip the duel',
        duel_hold: 'Stand your ground. How do you react in this duel?',
        shoot: 'SHOOT',
        lower_gun: 'LOWER YOUR GUN',
        dust_settling: 'The dust is settling...',
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

        secret_choice: 'Your choice is SECRET. Nobody will see your decision.',
        choice_registered_short: 'Choice registered!',
        pass_phone: 'Pass the phone',

        menu: 'Saloon',
        sound_on: 'Sound on',
        sound_off: 'Sound off',
        language: 'Language',
        home_screen: 'Home screen',

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
