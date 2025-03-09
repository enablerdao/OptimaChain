// SVGアイコンを定義
const icons = {
    // ドキュメントアイコン
    document: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 8C12 6.89543 12.8954 6 14 6H28L36 14V40C36 41.1046 35.1046 42 34 42H14C12.8954 42 12 41.1046 12 40V8Z" fill="#E3F2FD"/>
        <path d="M28 6L36 14H30C28.8954 14 28 13.1046 28 12V6Z" fill="#BBDEFB"/>
        <path d="M18 22H30M18 28H30M18 34H24" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // ツールキットアイコン
    toolkit: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="16" width="32" height="24" rx="2" fill="#E3F2FD"/>
        <path d="M16 16V12C16 9.79086 17.7909 8 20 8H28C30.2091 8 32 9.79086 32 12V16" stroke="#0071E3" stroke-width="2"/>
        <rect x="20" y="24" width="8" height="8" rx="1" fill="#0071E3"/>
    </svg>`,
    
    // 検索/エクスプローラーアイコン
    explorer: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="14" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <path d="M32 32L40 40" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // 助成金アイコン
    grant: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" fill="#E3F2FD"/>
        <path d="M24 14V34M18 18H30M18 30H30" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // ステーキングアイコン
    staking: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8L36 16V32L24 40L12 32V16L24 8Z" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <path d="M24 20L30 24V32L24 36L18 32V24L24 20Z" fill="#0071E3"/>
    </svg>`,
    
    // ガバナンスアイコン
    governance: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="28" width="32" height="12" rx="2" fill="#E3F2FD"/>
        <path d="M12 28V18M36 28V18M24 28V18M8 18H40M16 8H32" stroke="#0071E3" stroke-width="2"/>
    </svg>`,
    
    // トランザクションアイコン
    transaction: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" fill="#E3F2FD"/>
        <path d="M16 24H32M32 24L26 18M32 24L26 30" stroke="#0071E3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // アクセスキーアイコン
    access: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="24" r="10" fill="#E3F2FD"/>
        <path d="M18 24C20.2091 24 22 22.2091 22 20C22 17.7909 20.2091 16 18 16C15.7909 16 14 17.7909 14 20C14 22.2091 15.7909 24 18 24Z" fill="#0071E3"/>
        <path d="M24 24H40M32 18V30" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // エコシステムアイコン
    ecosystem: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="6" fill="#0071E3"/>
        <circle cx="24" cy="8" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <circle cx="38" cy="16" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <circle cx="38" cy="32" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <circle cx="24" cy="40" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <circle cx="10" cy="32" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <circle cx="10" cy="16" r="4" fill="#E3F2FD" stroke="#0071E3" stroke-width="2"/>
        <path d="M24 14V18M33.5 19L30 22M33.5 29L30 26M24 30V34M14.5 29L18 26M14.5 19L18 22" stroke="#0071E3" stroke-width="2"/>
    </svg>`,
    
    // コミュニティアイコン
    community: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="16" r="8" fill="#E3F2FD"/>
        <circle cx="12" cy="32" r="6" fill="#E3F2FD"/>
        <circle cx="36" cy="32" r="6" fill="#E3F2FD"/>
        <path d="M24 24V36M24 36H18M24 36H30" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    
    // チームアイコン
    team: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="14" r="6" fill="#E3F2FD"/>
        <circle cx="12" cy="26" r="4" fill="#E3F2FD"/>
        <circle cx="36" cy="26" r="4" fill="#E3F2FD"/>
        <path d="M24 20V40M12 30V40H36V30" stroke="#0071E3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // リザーブアイコン
    reserve: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="14" width="28" height="20" rx="2" fill="#E3F2FD"/>
        <path d="M16 14V10M32 14V10M16 34V38M32 34V38M10 22H38" stroke="#0071E3" stroke-width="2" stroke-linecap="round"/>
    </svg>`
};

// アイコンをHTMLに挿入する関数
function insertIcons() {
    document.querySelectorAll('[data-icon]').forEach(element => {
        const iconName = element.getAttribute('data-icon');
        if (icons[iconName]) {
            element.innerHTML = icons[iconName];
        }
    });
}

// DOMが読み込まれたらアイコンを挿入
document.addEventListener('DOMContentLoaded', insertIcons);