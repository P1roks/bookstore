{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    mariadb
    # typescript
    # nodePackages.ts-node
    # nodePackages.nodemon
  ];
}
