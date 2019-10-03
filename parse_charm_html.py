import os
import re
import json
import pprint

from bs4 import BeautifulSoup


def main():
    pp = pprint.PrettyPrinter(indent=4)
    charms = get_charms_dict()
    # save_charms_as_json(charms)
    charm_count = 0
    charm_ability_counts = {}
    charm_name_lengths = []
    for key in charms.keys():
        print(key)
        charm_count += len(charms[key])
        if key not in charm_ability_counts:
            charm_ability_counts[key] = 0
        charm_ability_counts[key] += len(charms[key])
        for name, charm in charms[key].items():
            if name == 'Winning Stride Discipline':
                print(key)
                print(charm)

    print(f'{charm_count} charms found and saved to charms.json')



def save_charms_as_json(charms):
    with open('charms.json', 'w') as fp:
        json.dump(charms, fp)


def get_charms_dict():
    charms = {}

    folder = './charms'
    for file in os.listdir(folder):
        if (file[-5:] != '.html'):
            continue  # skipping non-html files
        if file[0] == '.':
            continue  # skipping .trashes and such.
        charms = {**charms, **parse_charm_html(folder, file)}
    return charms


def parse_charm_html(path, file):
    filepath = f'{path}/{file}'
    with open(filepath, encoding="utf-8") as file:
        soup = BeautifulSoup(file, 'html.parser')

    body = soup.body

    # finding non-empty pages.
    pages = list(filter(
                lambda x: len(list(x.children)) > 1,
                body.find_all('div', {'class': 'page'})
            ))

    charm = {}
    charms = {}
    # we need all the charm keys before a charm is complete
    charm_keys = (
                'name',
                'ability',
                'page',
                'essence_req',
                'ability_req',
                'cost',
                'type',
                'keywords',
                'duration',
                'pre_reqs',
                'description',
            )
    # this note_keys tuple is used to extract notes
    # into their own key in the charm dict
    note_keys = ('cost', 'type', 'keywords', 'duration', 'pre_reqs')

    pp = pprint.PrettyPrinter(indent=4)
    for page in pages:
        counter = 0
        problem_children = []
        if len(charm) > 0:
            print('floating charm found.')
            pp.pprint(charm)
            print(f"Showing rest of charms for {charm['ability']}")
            pp.pprint(charms[charm['ability']])
            exit()
            if charm['ability'] not in charms:
                charms[charm['ability']] = {}
            charms[charm['ability']][charm['name']] = charm
            charm = {}
        for child in page.children:
            key_added = False
            contents = str(child.contents[0]).strip()
            contents = contents.replace('  ', ' ')
            if contents in [' ', '', '\n']:
                continue

            if is_int(contents):
                charm['page'] = contents
                key_added = True

            # Only check it if we haven't already found our requierments.
            if len(contents) < 45 and is_requirements(contents):
                if ('essence_req' in charm):
                    print('------------')
                    print('Found requirements after already having requirements.')
                    print('------------')
                    print(contents)
                    pp.pprint(charm)
                    # print(page.prettify())
                    print(problem_children)
                    exit()
                ability_list = get_ability(contents)
                charm['ability'] = ability_list[0]
                charm['ability_req'] = ' '.join(ability_list)
                charm['essence_req'] = get_essence(contents)
                key_added = True

            if 'cost' not in charm and is_notes(contents):
                cost_pos = contents.find('Cost:')
                if (cost_pos is not 0):
                    charm['name'] = contents[:cost_pos]
                    contents = contents[cost_pos:]
                notes = prep_notes(contents)
                # I don't like resorting to numerical indexes,
                # but this works really well.
                for i, key in enumerate(note_keys):
                    try:
                        charm[note_keys[i]] = notes[i].strip()
                    except KeyError:
                        print(f'Notes appear malformed or may be missing info')
                        print(notes)
                key_added = True

            # nothing else tripped along the way so the thing we found must be
            # the charm name or description

            if not key_added:
                if ('name' not in charm or len(charm) == 0):
                    charm['name'] = contents

                if len(contents) > len(charm['name']):
                    charm['description'] = contents
                else:
                    # looks like we got our description in our name by mistkae.
                    # We'll just swap them around.
                    charm['description'] = charm['name']
                    charm['name'] = contents

                if is_int(contents[-3:]):
                    charm['page'] = contents[-3:]

            problem_children.append(child)
            if all(key in charm for key in charm_keys):
                # charm complete!
                # Now that we're here, we'll clean up the description a little.
                # If the last three characters are a page number
                # then we can remove that page number, and the preceding space.
                if is_int(charm['description'][-3:]):
                    charm['description'] = charm['description'][:-4]
                if charm['ability'] not in charms:
                    charms[charm['ability']] = {}
                charms[charm['ability']][charm['name']] = charm
                if len(charm['name']) > 70:
                    print('Unsually long name found.')
                    print(charm)
                    exit()
                charm = {}
                counter = 0
                problem_children = []
                continue
            if counter > 4:
                # we've gone too far without finding a full charm.
                # Time to debug.
                print('Counter hit max before finishing a charm')
                print(charm)
                print()
                for problem_child in problem_children:
                    print(str(problem_child.contents[0]).strip())
                print()
                exit()
            counter += 1

        # used to test just the first page.
        # break

    return charms


def get_ability(contents):
    contents = contents.replace(',', '')
    contents = contents.split()
    # we use -2 as the ending index here, as it's possible to have multiple
    # ability requirements. In those cases, the first is the main ability
    # but the second still matters, and needs to be included in the ability
    # requirement list.
    return contents[0:-2]


def get_essence(contents):
    contents = contents.replace(',', '')
    contents = contents.split()
    return ' '.join(contents[-2:])


def prep_notes(contents):
    # Turning a raw notes string
    # 'Cost: 1m; Type: Supplemental Keywords: Uniform Duration: Instant
    #       Prerequisite Charms: Streaming Arrow Stance'
    # into a string we can split
    # 1m|Supplemental|Uniform|Instant|Streaming Arrow Stance
    # then returning the split list
    contents = contents.replace('  ', ' ')
    contents = contents.replace('Cost:', '')
    contents = contents.replace(' Type: ', '|')
    contents = contents.replace(' Keywords: ', '|')
    contents = contents.replace(' Duration: ', '|')
    contents = contents.replace(' Prerequisite Charms: ', '|')
    return contents.split('|')


def is_requirements(contents):
    # to help ensure that we don't match the description by mistake
    # we add the number behind and after.
    regex = re.compile(r'\d, Essence \d')
    if re.search(regex, contents):
        return True
    return False


def is_notes(contents):
    regex = re.compile('Cost:')
    if re.search(regex, contents):
        return True
    return False


def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False


if __name__ == '__main__':
    main()
