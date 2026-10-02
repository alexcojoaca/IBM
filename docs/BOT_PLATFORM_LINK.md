# IBM bot ↔ platform

## What runs where

| Piece | Where | Why |
|-------|--------|-----|
| Website (account, buy, admin, license API) | **Vercel** `https://ibm-six-psi.vercel.app` | Online control |
| Desktop bot UI + trading engine | **Windows PC** next to MetaTrader 5 | MT5 cannot run on Vercel |
| License key check | Bot → calls platform `/api/license/*` | Same keys as Admin |

MetaTrader connection stays **local**. Only the license is online.

## Customer flow

1. Buy / get key on the website  
2. Download `IBM-Client.zip`  
3. Run `Start IBM.cmd`  
4. Enter key → validated on `ibm-six-psi.vercel.app`  
5. Connect MT5 on this PC  
6. Sign out in bot (or Devices on website) frees the seat  

## Rebuild client package (dev)

```powershell
cd "IBM bot\client"
npm run build
$env:IBM_LICENSE_API_URL="https://ibm-six-psi.vercel.app"
python ..\scripts\build_client_package.py
```

Then update the GitHub Release ZIP.
