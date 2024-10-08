{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.openssl # For Prisma
    pkgs.postgresql_16

    pkgs.nodePackages.nodemon
    pkgs.nodePackages.pnpm
    pkgs.nodePackages.pm2
  ];

  shellHook = ''
    export PGDATA="$PWD/.pgdata"
    mkdir -p "$PGDATA"

    if [ ! -f "$PGDATA/PG_VERSION" ]; then
      initdb --username=postgres --pwfile=<(echo "parol") --auth=trust "$PGDATA"
    fi

    # Postgresni boshqa portda ishga tushirish (ixtiyoriy)
    if [ ! -f "$PGDATA/postgresql.conf.bak" ]; then
      cp "$PGDATA/postgresql.conf" "$PGDATA/postgresql.conf.bak"
      echo "port = 5432" >> "$PGDATA/postgresql.conf"
    fi

    pg_ctl -D "$PGDATA" -l "$PGDATA/logfile" start

    # Muhit o'zgaruvchilari
    export DATABASE_URL="postgresql://postgres:parol@localhost:5432/databasename"
    export NODE_ENV=development
    export ANOTHER_ENV_VAR="qiymat"

    function stop_postgres {
      pg_ctl -D "$PGDATA" stop
    }
    trap stop_postgres EXIT
  '';
}

