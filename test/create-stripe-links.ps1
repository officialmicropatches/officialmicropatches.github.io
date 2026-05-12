# ============================================================
# MicroPatches — Stripe Payment Link Creator
# ============================================================
# STEP 1: Paste your Stripe SECRET key on the line below
#         (starts with sk_live_ or sk_test_)
# ============================================================

$STRIPE_KEY = "PASTE_YOUR_SECRET_KEY_HERE"

# ============================================================
# Do not edit below this line
# ============================================================

if ($STRIPE_KEY -eq "PASTE_YOUR_SECRET_KEY_HERE") {
    Write-Host "ERROR: You forgot to paste your Stripe secret key on line 9." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating Stripe products and payment links..." -ForegroundColor Cyan
Write-Host ""

# --- Product 1: Standard Patch Keychain $12.99 ---
$p1 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "currency=usd&unit_amount=1299&product_data[name]=Patch+Keychain+Standard"

$pl1 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "line_items[0][price]=$($p1.id)&line_items[0][quantity]=1&after_completion[type]=redirect&after_completion[redirect][url]=https://officialmicropatches.github.io"

Write-Host "12.99: $($pl1.url)" -ForegroundColor Green

# --- Product 2: Patch Magnet $7.99 ---
$p2 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "currency=usd&unit_amount=799&product_data[name]=Patch+Magnet"

$pl2 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "line_items[0][price]=$($p2.id)&line_items[0][quantity]=1&after_completion[type]=redirect&after_completion[redirect][url]=https://officialmicropatches.github.io"

Write-Host "7.99: $($pl2.url)" -ForegroundColor Green

# --- Product 3: Croc Charm $8.99 ---
$p3 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "currency=usd&unit_amount=899&product_data[name]=Croc+Charm"

$pl3 = Invoke-RestMethod -Uri "https://api.stripe.com/v1/payment_links" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $STRIPE_KEY" } `
    -ContentType "application/x-www-form-urlencoded" `
    -Body "line_items[0][price]=$($p3.id)&line_items[0][quantity]=1&after_completion[type]=redirect&after_completion[redirect][url]=https://officialmicropatches.github.io"

Write-Host "8.99: $($pl3.url)" -ForegroundColor Green

Write-Host ""
Write-Host "Done. Copy the 3 lines above and paste them to Claude." -ForegroundColor Cyan
Write-Host ""
