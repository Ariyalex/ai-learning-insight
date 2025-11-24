set -e

RETRY_INTERVAL= ${RETRY_INTERVAL:-2}
MAX_RETRIES=${MAX_RETRIES:-60}
i=0

echo "Entrypoint: starting init task..."

# tunggu & retry hingga migrate success (db siap)
until npm run migrate:up; do
    i=$((i+1))
    echo "migrate failed, retying in ${RETRY_INTERVAL}s (attempt $i/$MAX_RETRIES)"
    ["$i" -ge "$MAX_RETRIES"] && { echo "migrate failed after $i attempts"; exit 1;}
    sleep "$RETRY_INTERVAL"
done

#jalankan import csv(retry, tapi jangan crash container kalau gagal setelah retry)
j=0
until node -e "
    const db = require('./src/db');
    (async ()=>{
        const { rows } = await db.query('SELECT COUNT(*) AS c FROM your_table_name');
        if (parseInt(rows[0].c,10) === 0) {
        console.log('running import:csv');
        process.exit(0); // let npm run import:csv execute
        } else {
        console.log('import skipped; table not empty');
        process.exit(2); // signal to skip import
        }
    })().catch(e=>{ console.error(e); process.exit(1); });
"; do
    j=$((j+1))
    echo "import:csv failed, retrying ini ${RETRY_INTERVAL}s (attempt $j/$MAX_RETRIES)"
    [ "$j" -ge "$MAX_RETRIES" ] && { echo "import failed after $j attempts, continuing"; break;}
    sleep "$RETRY_INTERVAL"
done

# If the helper exited 0 we run the actual import, if exited 2 we skip.
if [ $? -eq 0 ]; then
  npm run import:csv || echo "import script failed but continuing"
else
  echo "import skipped"
fi

echo "init task done. starting app..."
exec npm run dev