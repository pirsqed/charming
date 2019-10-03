from tika import parser
import os


def main():
    for file in os.listdir('./pdfs'):
        if (file[-4:] != '.pdf'):
            continue  # skipping non-pdf files
        if file[0] == '.':
            continue  # skipping .trashes and such.
        pdf2html('./pdfs/'+file, file)


def pdf2html(filepath, filename):
    raw = parser.from_file(filepath, xmlContent=True)
    content = raw['content']
    content = content.replace('- ', '')
    content = content.replace('  ', ' ')
    content = content.replace('-\n', '')
    content = content.replace('\n', ' ')
    content = content.replace('<p /> ', '')
    content = content.replace('> <', '><')
    outputfile = filename[:-4]
    with open(f'{outputfile}.html', 'w', encoding="utf-8") as file:
        file.write(content)
    print(f'{filepath} processed successfully')


if __name__ == '__main__':
    main()
