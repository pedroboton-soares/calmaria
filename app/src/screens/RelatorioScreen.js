// Tela da aba Relatório: a pessoa escolhe o período e baixa um PDF com os seus registros
// (GET /relatorio/pdf?inicio=&fim=). Depois pode abrir, compartilhar ou salvar em Downloads.
// O download usa react-native-blob-util porque o fetch comum não salva arquivo e
// a rota precisa do token no cabeçalho.

import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useTema } from '../context/TemaContext';
import { API_URL, obterToken } from '../services/api';
import { dataDeHoje, diasAtras, formatarDataBR } from '../utils/datas';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

// Períodos que a pessoa pode escolher. dias = null quer dizer "todos os registros"
const PERIODOS = [
  { nome: 'Últimos 7 dias', dias: 6 },
  { nome: 'Últimos 30 dias', dias: 29 },
  { nome: 'Todos os registros', dias: null },
];

// O que faz: desenha uma opção de período; a escolhida fica preenchida e com "✓"
function OpcaoPeriodo({ periodo, selecionado, aoEscolher }) {
  const { cores, tamanho } = useTema();
  return (
    <TouchableOpacity
      onPress={() => aoEscolher(periodo)}
      accessibilityRole="radio"
      accessibilityLabel={'Período: ' + periodo.nome}
      accessibilityState={{ selected: selecionado, checked: selecionado }}
      style={[
        estilos.opcao,
        { backgroundColor: selecionado ? cores.primaria : cores.cartao, borderColor: cores.primaria },
      ]}
    >
      <Text
        style={{
          color: selecionado ? cores.textoSobrePrimaria : cores.texto,
          fontSize: tamanho(15),
          fontWeight: selecionado ? 'bold' : 'normal',
          textAlign: 'center',
        }}
      >
        {(selecionado ? '✓ ' : '') + periodo.nome}
      </Text>
    </TouchableOpacity>
  );
}

export default function RelatorioScreen() {
  const { cores, tamanho } = useTema();

  const [periodo, setPeriodo] = useState(PERIODOS[1]);
  const [baixando, setBaixando] = useState(false);
  const [arquivo, setArquivo] = useState(null); // caminho do PDF baixado no celular
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');

  const inicio = periodo.dias === null ? null : diasAtras(periodo.dias);
  const fim = dataDeHoje();

  // O que faz: troca o período e esquece o PDF anterior (ele era de outro período)
  function escolherPeriodo(novo) {
    setPeriodo(novo);
    setArquivo(null);
    setAviso('');
    setErro('');
  }

  // O que faz: baixa o PDF da API para a pasta do app e já abre para a pessoa ver
  async function baixar() {
    setErro('');
    setAviso('');
    setBaixando(true);
    try {
      let url = API_URL + '/relatorio/pdf?fim=' + fim;
      if (inicio) {
        url += '&inicio=' + inicio;
      }
      const token = await obterToken();
      const caminho = ReactNativeBlobUtil.fs.dirs.DocumentDir + '/relatorio-calmaria.pdf';

      let resposta;
      try {
        resposta = await ReactNativeBlobUtil.config({ path: caminho }).fetch('GET', url, {
          Authorization: 'Bearer ' + token,
        });
      } catch (e) {
        // Só cai aqui quando nem chegou a falar com o servidor (API desligada, sem internet)
        throw new Error('Não foi possível conectar ao servidor.');
      }

      // Se a API respondeu erro, o arquivo salvo é o JSON do erro, não um PDF
      if (resposta.info().status !== 200) {
        let dados = {};
        try {
          dados = JSON.parse(await resposta.text());
        } catch (e) {
          // resposta sem JSON: fica com a mensagem padrão abaixo
        }
        throw new Error(dados.erro || 'Não foi possível gerar o relatório.');
      }

      setArquivo(caminho);
      setAviso('Relatório pronto. Ele fica guardado só neste celular até você salvar ou compartilhar.');
      await abrir(caminho);
    } catch (e) {
      setErro(e.message);
    } finally {
      setBaixando(false);
    }
  }

  // O que faz: abre o PDF em outro app (leitor de PDF, e-mail, WhatsApp...), à escolha da pessoa
  async function abrir(caminho = arquivo) {
    try {
      await ReactNativeBlobUtil.open.chooser(caminho, { mime: 'application/pdf', title: 'Abrir relatório com' });
    } catch (e) {
      setAviso('O relatório foi baixado, mas não há app para abrir PDF. Use "Salvar em Downloads".');
    }
  }

  // O que faz: copia o PDF para a pasta Downloads do celular, onde a pessoa encontra depois
  async function salvarEmDownloads() {
    setErro('');
    try {
      const nome = 'relatorio-calmaria-' + fim + '.pdf';
      await ReactNativeBlobUtil.media.copyToMediaStore(
        { name: nome, parentFolder: '', mime: 'application/pdf' },
        'Download',
        arquivo
      );
      setAviso('Salvo em Downloads com o nome ' + nome + '.');
    } catch (e) {
      setErro('Não foi possível salvar em Downloads.');
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: cores.fundo }} contentContainerStyle={estilos.rolagem}>
      <View style={estilos.conteudo}>
        <Text style={{ color: cores.textoSuave, fontSize: tamanho(14), marginBottom: 12 }}>
          Gere um PDF com a média do humor e os seus registros. Ele pode ser útil para guardar ou para mostrar a
          um profissional ou a alguém de confiança.
        </Text>

        <Cartao>
          <Text accessibilityRole="header" style={{ color: cores.texto, fontSize: tamanho(16), fontWeight: 'bold', marginBottom: 8 }}>
            Período
          </Text>
          <View style={estilos.opcoes} accessibilityRole="radiogroup">
            {PERIODOS.map((p) => (
              <OpcaoPeriodo key={p.nome} periodo={p} selecionado={periodo === p} aoEscolher={escolherPeriodo} />
            ))}
          </View>
          <Text style={{ color: cores.textoSuave, fontSize: tamanho(13), marginTop: 10 }}>
            {inicio ? 'De ' + formatarDataBR(inicio) + ' até ' + formatarDataBR(fim) + '.' : 'Desde o primeiro registro até hoje.'}
          </Text>
        </Cartao>

        <Botao
          titulo={baixando ? 'Gerando o relatório...' : 'Gerar e abrir o PDF'}
          onPress={baixar}
          desabilitado={baixando}
        />

        {aviso ? (
          <Text accessibilityLiveRegion="polite" style={{ color: cores.sucesso, fontSize: tamanho(14), marginTop: 12 }}>
            {aviso}
          </Text>
        ) : null}
        {erro ? (
          <Text accessibilityLiveRegion="polite" style={{ color: cores.erro, fontSize: tamanho(14), marginTop: 12 }}>
            {erro}
          </Text>
        ) : null}

        {arquivo ? (
          <View style={estilos.botoes}>
            <Botao titulo="Abrir ou compartilhar" tipo="secundario" onPress={() => abrir()} />
            <Botao titulo="Salvar em Downloads" tipo="secundario" onPress={salvarEmDownloads} />
          </View>
        ) : null}

        <Text style={{ color: cores.textoSuave, fontSize: tamanho(13), marginTop: 16 }}>
          O PDF tem informações sobre a sua saúde. Compartilhe só com quem você confia.
        </Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  rolagem: { padding: 16 },
  conteudo: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao: {
    flexGrow: 1,
    minWidth: 110,
    minHeight: 48,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botoes: { gap: 12, marginTop: 12 },
});
