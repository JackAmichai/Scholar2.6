import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Chat Interface
            'chat.title': 'Scholar 2.6',
            'chat.subtitle': 'AI Research Navigator',
            'chat.placeholder': 'Type your response...',
            'chat.thinking': 'Thinking...',
            'chat.greeting': "Hey there! 👋 I'm your research navigator. What topic are you exploring today?",

            // Graph View
            'graph.title': 'Knowledge Graph',
            'graph.back': 'Back to Chat',
            'graph.zoomIn': 'Zoom In',
            'graph.zoomOut': 'Zoom Out',
            'graph.reset': 'Reset View',
            'graph.filter': 'Filter',
            'graph.search': 'Search papers...',
            'graph.save': 'Save State',
            'graph.load': 'Load State',
            'graph.export': 'Export BibTeX',

            // Tooltips
            'tooltip.abstract': 'Abstract',
            'tooltip.citations': 'Citations',
            'tooltip.year': 'Year',
            'tooltip.authors': 'Authors',

            // Actions
            'action.export': 'Export',
            'action.close': 'Close',
            'action.voice': 'Use voice input',
            'action.theme': 'Toggle theme',
            'action.colorScheme': 'Color scheme',

            // Analytics
            'analytics.metrics': 'Network Metrics',
            'analytics.recommendations': 'Recommended Papers',
            'analytics.trends': 'Publication Trends',
            'analytics.authors': 'Author Collaboration'
        }
    },
    es: {
        translation: {
            'chat.title': 'Scholar 2.6',
            'chat.subtitle': 'Navegador de Investigación IA',
            'chat.placeholder': 'Escribe tu respuesta...',
            'chat.thinking': 'Pensando...',
            'chat.greeting': '¡Hola! 👋 Soy tu navegador de investigación. ¿Qué tema estás explorando hoy?',

            'graph.title': 'Grafo de Conocimiento',
            'graph.back': 'Volver al Chat',
            'graph.zoomIn': 'Ampliar',
            'graph.zoomOut': 'Reducir',
            'graph.reset': 'Restablecer Vista',
            'graph.search': 'Buscar artículos...',
            'graph.export': 'Exportar BibTeX',

            'action.export': 'Exportar',
            'action.close': 'Cerrar',
            'action.voice': 'Usar entrada de voz',
            'action.theme': 'Cambiar tema'
        }
    },
    zh: {
        translation: {
            'chat.title': 'Scholar 2.6',
            'chat.subtitle': 'AI学术导航',
            'chat.placeholder': '输入您的回复...',
            'chat.thinking': '思考中...',
            'chat.greeting': '你好！👋 我是你的研究导航员。你今天想探索什么主题？',

            'graph.title': '知识图谱',
            'graph.back': '返回聊天',
            'graph.zoomIn': '放大',
            'graph.zoomOut': '缩小',
            'graph.reset': '重置视图',
            'graph.search': '搜索论文...',
            'graph.export': '导出BibTeX',

            'action.export': '导出',
            'action.close': '关闭',
            'action.voice': '使用语音输入',
            'action.theme': '切换主题'
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
